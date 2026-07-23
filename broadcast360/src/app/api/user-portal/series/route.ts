import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ScheduleStatus } from "@/generated/prisma";
const corsHeaders = {
  "Access-Control-Allow-Origin": "http://localhost:3001",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const search = searchParams.get("search") || "";
    const channelId = searchParams.get("channelId");
    const type = searchParams.get("type");

    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 20);

    const skip = (page - 1) * limit;

    /**
     * Episode becomes available:
     * schedule endTime + 1 hour
     */
    //const availableTime = new Date(Date.now() - 60 * 60 * 1000);
    const availableTime = new Date(Date.now() - 1 * 60 * 1000);

    /**
     * Remove content older than one month
     */
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    //const oneMonthAgo = new Date(Date.now() - 5 * 60 * 1000);

    const episodes = await prisma.episode.findMany({
      where: {
        series: {
          title: {
            contains: search,
            mode: "insensitive",
          },
        },

        playlistItems: {
          some: {
            playlist: {
              schedules: {
                some: {
                  status: ScheduleStatus.COMPLETED,

                  ...(channelId
                    ? {
                        channelId: Number(channelId),
                      }
                    : {}),

                  endTime: {
                    lte: availableTime,
                    gte: oneMonthAgo,
                  },
                },
              },
            },
          },
        },
      },

      include: {
        series: true,

        playlistItems: {
          include: {
            playlist: {
              include: {
                schedules: {
                  where: {
                    status: ScheduleStatus.COMPLETED,

                    ...(channelId
                      ? {
                          channelId: Number(channelId),
                        }
                      : {}),

                    endTime: {
                      lte: availableTime,
                      gte: oneMonthAgo,
                    },
                  },

                  include: {
                    channel: true,
                  },

                  orderBy: {
                    endTime: "desc",
                  },

                  take: 1,
                },
              },
            },
          },
        },
      },

      orderBy: {
        episodeNo: "desc",
      },
    });

    /*
      Convert Episode[] into Series[]
    */

    const seriesMap = new Map<number, any>();

    for (const episode of episodes) {
      const schedule = episode.playlistItems
        .flatMap((item) => item.playlist.schedules)
        .sort(
          (a, b) =>
            new Date(b.endTime!).getTime() - new Date(a.endTime!).getTime(),
        )[0];

      if (!schedule) continue;

      const series = episode.series;

      const current = seriesMap.get(series.id);

      const episodeData = {
        id: episode.id,
        title: episode.title,
        episodeNo: episode.episodeNo,
        duration: episode.duration,
        videoUrl: episode.videoUrl,
      };

      if (!current || episode.episodeNo > current.latestEpisode.episodeNo) {
        seriesMap.set(series.id, {
          id: series.id,

          title: series.title,

          description: series.description,

          genre: series.genre,

          releaseYear: series.releaseYear,

          thumbnail: series.thumbnail
            ? `http://localhost:3000${series.thumbnail}`
            : null,

          latestEpisode: episodeData,

          channel: {
            id: schedule.channel.id,
            name: schedule.channel.name,
          },

          schedule: {
            id: schedule.id,
            startTime: schedule.startTime,
            endTime: schedule.endTime,
          },
        });
      }
    }

    let result = Array.from(seriesMap.values());

    result.sort(
      (a, b) =>
        new Date(b.schedule.endTime).getTime() -
        new Date(a.schedule.endTime).getTime(),
    );

    /*
      Hot series
    */

    if (type === "hot") {
      result = result.slice(0, 10);
    }

    const total = result.length;

    const data = type === "hot" ? result : result.slice(skip, skip + limit);

    return NextResponse.json(
      {
        success: true,

        series: data,

        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },

      {
        status: 200,
        headers: corsHeaders,
      },
    );
  } catch (error) {
    console.error("SERIES LIST ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch series",
      },

      {
        status: 500,
        headers: corsHeaders,
      },
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,

    headers: corsHeaders,
  });
}
