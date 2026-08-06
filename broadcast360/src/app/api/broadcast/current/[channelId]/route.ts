import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Adjust path to your Prisma client instance

export async function GET(
  request: Request,
  context: { params: Promise<{ channelId: string }> }
) {
  try {
    const { channelId: rawChannelId } = await context.params;
    const channelId = Number(rawChannelId);

    if (isNaN(channelId) || channelId <= 0) {
      return NextResponse.json(
        { error: "Invalid channel ID provided" },
        { status: 400 }
      );
    }

    // 1. Fetch active session with its schedule, playlist, and items
    const session = await prisma.broadcastSession.findUnique({
      where: { channelId },
      include: {
        schedule: {
          include: {
            playlist: {
              include: {
                items: {
                  orderBy: { order: "asc" },
                  include: {
                    movie: true,
                    episode: {
                      include: { series: true },
                    },
                    advertisement: true,
                    news: true,
                    entertainment: true,
                    stream: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!session || session.status !== "LIVE") {
      return NextResponse.json({
        data: {
          status: session?.status ?? "STOPPED",
          nowPlaying: null,
          nextItem: null,
        },
      });
    }

    const items = session.schedule?.playlist?.items ?? [];

    if (items.length === 0) {
      return NextResponse.json({
        data: {
          status: session.status,
          nowPlaying: null,
          nextItem: null,
        },
      });
    }

    // 2. Find current item by session.currentItemId or default to first item
    let currentIndex = items.findIndex((item) => item.id === session.currentItemId);
    if (currentIndex === -1) currentIndex = 0;

    const currentItem = items[currentIndex];
    const nextItem = items[currentIndex + 1] ?? null;

    // Helper function to extract unified title, thumbnail, duration, and subtitle
    const formatPlaylistItem = (item: typeof currentItem) => {
      if (!item) return null;

      let title = "Unknown Title";
      let thumbnail: string | null = null;
      let duration = item.duration ?? 0;

      switch (item.type) {
        case "MOVIE":
          title = item.movie?.title ?? title;
          thumbnail = item.movie?.thumbnail ?? null;
          duration = item.movie?.duration ?? duration;
          break;

        case "EPISODE":
          title = item.episode?.title ?? title;
          thumbnail = item.episode?.thumbnailUrl ?? item.episode?.series?.thumbnail ?? null;
          duration = item.episode?.duration ?? duration;
          break;

        case "ADVERTISEMENT":
          title = item.advertisement?.title ?? title;
          thumbnail = item.advertisement?.thumbnailUrl ?? null;
          duration = item.advertisement?.duration ?? duration;
        
          break;

        case "NEWS":
          title = item.news?.title ?? title;
          thumbnail = item.news?.image ?? null;
          duration = item.news?.duration ?? duration;
          break;

        case "ENTERTAINMENT":
          title = item.entertainment?.title ?? title;
          thumbnail = item.entertainment?.thumbnail ?? null;
          duration = item.entertainment?.duration ?? duration;
          break;

        case "STREAM":
          title = item.stream?.name ?? title;
         break;
      }

      return {
        id: item.id,
        order: item.order,
        type: item.type,
        title,
        thumbnail,
        duration,
      };
    };

    return NextResponse.json({
      data: {
        status: session.status,
        startedAt: session.startedAt,
        nowPlaying: formatPlaylistItem(currentItem),
        nextItem: nextItem ? formatPlaylistItem(nextItem) : null,
      },
    });
  } catch (error) {
    console.error("Error in now-playing route:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}