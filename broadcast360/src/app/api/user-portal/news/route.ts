import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function formatMediaUrl(rawPath: string | null): string | null {
  if (!rawPath) return null;
  if (rawPath.startsWith("http://") || rawPath.startsWith("https://")) {
    return rawPath;
  }
  const filename = rawPath.split(/[/\\]/).pop();
  return filename ? `/api/user-portal/media/${encodeURIComponent(filename)}` : null;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const channelId = searchParams.get("channelId");
    const type = searchParams.get("type");
    const limit = searchParams.get("limit");

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
      take: limit ? parseInt(limit, 10) : undefined,
    });

    const formattedNews = newsList.map((item) => {
      const rawVideoUrl = item.videoUrl || item.recording?.fileUrl || null;

      return {
        id: item.id,
        title: item.title?.trim() || "Recorded Broadcast",
        content: item.content || "No description provided for this broadcast recording.",
        image: formatMediaUrl(item.image),
        videoUrl: formatMediaUrl(rawVideoUrl),
        duration: item.duration || item.recording?.duration || null,
        type: item.type || "NEWS",
        createdAt: item.createdAt.toISOString(),
        channel: item.channel
          ? {
              id: item.channel.id,
              name: item.channel.name,
              logo: formatMediaUrl(item.channel.logo),
            }
          : null,
      };
    });

    return NextResponse.json({ news: formattedNews }, { status: 200, headers: corsHeaders });
  } catch (error) {
    console.error("PUBLIC NEWS API ERROR:", error);
    return NextResponse.json(
      { message: "Cannot fetch news items", news: [] },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}