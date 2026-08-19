import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cors, optionsResponse } from "@/lib/cors";

function formatMediaUrl(rawPath: string | null, origin: string): string | null {
  if (!rawPath) return null;
  if (rawPath.startsWith("http://") || rawPath.startsWith("https://")) {
    return rawPath;
  }
  const filename = rawPath.split(/[/\\]/).pop();
  return filename
    ? new URL(
        `/api/user-portal/media/${encodeURIComponent(filename)}`,
        origin,
      ).toString()
    : null;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const channelId = searchParams.get("channelId");
    const type = searchParams.get("type");
    const requestedLimit = Number.parseInt(searchParams.get("limit") || "50", 10);
    const take = Number.isFinite(requestedLimit)
      ? Math.min(Math.max(requestedLimit, 1), 100)
      : 50;
    const backendOrigin = new URL(request.url).origin;

    const whereClause: Record<string, any> = {};
    if (channelId) whereClause.channelId = parseInt(channelId, 10);
    if (type) whereClause.type = type;

    const newsList = await prisma.news.findMany({
      where: whereClause,
      include: {
        channel: {
          select: { id: true, name: true, logo: true },
        },
        recording: {
          select: { id: true, title: true, fileUrl: true, duration: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take,
    });

    const formattedNews = newsList.map((item) => {
      const rawVideoUrl = item.videoUrl || item.recording?.fileUrl || null;

      return {
        id: item.id,
        title: item.title?.trim() || "Recorded Broadcast",
        content: item.content || "No description provided for this broadcast recording.",
        image: formatMediaUrl(item.image, backendOrigin),
        videoUrl: formatMediaUrl(rawVideoUrl, backendOrigin),
        duration: item.duration || item.recording?.duration || null,
        type: item.type || "NEWS",
        createdAt: item.createdAt.toISOString(),
        channel: item.channel
          ? {
              id: item.channel.id,
              name: item.channel.name,
              logo: formatMediaUrl(item.channel.logo, backendOrigin),
            }
          : null,
      };
    });

    return cors(
      NextResponse.json(
        { news: formattedNews },
        {
          status: 200,
          headers: {
            "Cache-Control": "public, s-maxage=15, stale-while-revalidate=60",
          },
        },
      ),
    );
  } catch (error) {
    console.error("PUBLIC NEWS API ERROR:", error);
    return cors(
      NextResponse.json(
        { message: "Cannot fetch news items", news: [] },
        { status: 500 },
      ),
    );
  }
}

export function OPTIONS() {
  return optionsResponse();
}