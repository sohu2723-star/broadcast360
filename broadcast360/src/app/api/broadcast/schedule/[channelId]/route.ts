import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  context: { params: Promise<{ channelId: string }> }
) {
  try {
    const { channelId: rawChannelId } = await context.params;
    const channelId = Number(rawChannelId);

    if (isNaN(channelId) || channelId <= 0) {
      return NextResponse.json({ error: "Invalid channel ID" }, { status: 400 });
    }

    const now = new Date();
    const fifteenMinsPast = new Date(now.getTime() - 15 * 60 * 1000);
    const fifteenMinsFuture = new Date(now.getTime() + 15 * 60 * 1000);

    // Query schedules touching the 30-min window (-15m to +15m)
    const schedules = await prisma.schedule.findMany({
      where: {
        channelId,
        OR: [
          {
            startTime: {
              gte: fifteenMinsPast,
              lte: fifteenMinsFuture,
            },
          },
          {
            endTime: {
              gte: fifteenMinsPast,
              lte: fifteenMinsFuture,
            },
          },
        ],
      },
      orderBy: { startTime: "asc" },
      include: {
        playlist: {
          include: {
            program: true,
            items: {
              orderBy: { order: "asc" },
              include: {
                movie: true,
                episode: { include: { series: true } },
                advertisement: true,
                news: true,
                entertainment: true,
                stream: true,
              },
            },
          },
        },
      },
    });

    const previous: any[] = [];
    const upcoming: any[] = [];

    schedules.forEach((sched) => {
      const startTime = new Date(sched.startTime);
      const endTime = sched.endTime ? new Date(sched.endTime) : new Date(startTime.getTime() + 30 * 60 * 1000);

      // Dynamically calculate status based on current time clock
      let computedStatus: "COMPLETED" | "LIVE" | "SCHEDULED" = "SCHEDULED";

      if (now >= endTime) {
        computedStatus = "COMPLETED";
      } else if (now >= startTime && now < endTime) {
        computedStatus = "LIVE";
      } else {
        computedStatus = "SCHEDULED";
      }

      const itemsCount = sched.playlist?.items.length ?? 0;
      const itemTitles = (sched.playlist?.items ?? [])
        .map((item) => {
          switch (item.type) {
            case "MOVIE": return item.movie?.title;
            case "EPISODE": return item.episode ? `${item.episode.series?.title ?? "Series"} S1:E${item.episode.episodeNo}` : null;
            case "ADVERTISEMENT": return item.advertisement?.title;
            case "NEWS": return item.news?.title;
            case "ENTERTAINMENT": return item.entertainment?.title;
            case "STREAM": return item.stream?.name;
            default: return null;
          }
        })
        .filter(Boolean);

      const formattedItem = {
        id: sched.id,
        status: computedStatus, // Computed status overrides static DB status
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        programTitle: sched.playlist?.program?.title ?? "General Program",
        programType: sched.playlist?.program?.type ?? "ENTERTAINMENT",
        playlistName: sched.playlist?.name ?? "Default Playlist",
        totalItems: itemsCount,
        itemTitles: itemTitles.slice(0, 3),
      };

      if (computedStatus === "COMPLETED") {
        previous.push(formattedItem);
      } else {
        upcoming.push(formattedItem);
      }
    });

    return NextResponse.json({
      data: {
        serverTime: now.toISOString(),
        previous,
        upcoming,
      },
    });
  } catch (error) {
    console.error("Error in schedule route:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}