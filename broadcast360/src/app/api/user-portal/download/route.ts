import { NextRequest, NextResponse } from "next/server";

import { cors, optionsResponse } from "@/lib/cors";
import { verifyUserToken } from "@/lib/user-jwt";
import { prisma } from "@/lib/prisma";
import { getR2MediaObject } from "@/lib/media/r2-storage";
import { getVodEntitlement } from "@/services/vod-entitlement.service";

function safeDownloadName(value: string) {
  const name = value.trim().replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "");
  return name.slice(0, 120) || "flickscope-video";
}

export function OPTIONS() {
  return optionsResponse();
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("user_token")?.value;
    if (!token) return cors(NextResponse.json({ message: "Unauthorized" }, { status: 401 }));

    const payload = await verifyUserToken(token);
    const entitlement = await getVodEntitlement(Number(payload.id));
    if (!entitlement.isPremium) {
      return cors(NextResponse.json({ message: "Premium access is required for downloads" }, { status: 403 }));
    }

    const movieId = Number(request.nextUrl.searchParams.get("movieId") || "");
    const episodeId = Number(request.nextUrl.searchParams.get("episodeId") || "");
    if ((Number.isInteger(movieId) ? 1 : 0) + (Number.isInteger(episodeId) ? 1 : 0) !== 1) {
      return cors(NextResponse.json({ message: "Provide exactly one movieId or episodeId" }, { status: 400 }));
    }

    const media = movieId
      ? await prisma.movie.findUnique({ where: { id: movieId }, select: { title: true, hdVideoUrl: true, videoUrl: true } })
      : await prisma.episode.findUnique({ where: { id: episodeId }, select: { title: true, hdVideoUrl: true, videoUrl: true } });

    if (!media) return cors(NextResponse.json({ message: "Video not found" }, { status: 404 }));
    const sourceUrl = media.hdVideoUrl ?? media.videoUrl;
    if (!sourceUrl) return cors(NextResponse.json({ message: "Download is not available" }, { status: 404 }));

    const object = await getR2MediaObject(sourceUrl);
    if (!object?.body) {
      return cors(NextResponse.json({ message: "Protected download storage is not configured for this media" }, { status: 404 }));
    }

    const headers = new Headers({
      "Content-Type": object.httpMetadata?.contentType || "video/mp4",
      "Content-Disposition": `attachment; filename="${safeDownloadName(media.title)}.mp4"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    });
    return cors(new NextResponse(object.body, { status: 200, headers }));
  } catch (error) {
    console.error("Protected download failed", error);
    return cors(NextResponse.json({ message: "Download failed" }, { status: 500 }));
  }
}
