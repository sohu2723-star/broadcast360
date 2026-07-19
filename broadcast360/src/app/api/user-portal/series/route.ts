import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
    const now = new Date();
    const availableTime = new Date(
      now.getTime() + 6.5 * 60 * 60 * 1000 - 60 * 60 * 1000,
    );

    const oneMonthAgo = new Date(now.getTime() + 6.5 * 60 * 60 * 1000);
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    console.log("NOW:", now);
    console.log("AVAILABLE:", availableTime);
    console.log("ONE MONTH AGO:", oneMonthAgo);

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
        createdAt: "desc",
      },
    });

    const seriesMap = new Map();

    episodes.forEach((episode) => {
      const series = episode.series;

      const schedule = episode.playlistItems[0]?.playlist.schedules[0];

      if (!schedule) return;

      if (!seriesMap.has(series.id)) {
        seriesMap.set(series.id, {
          id: series.id,

          title: series.title,

          description: series.description,

          genre: series.genre,

          releaseYear: series.releaseYear,

          thumbnail: series.thumbnail
            ? `http://localhost:3000${series.thumbnail}`
            : null,

          latestEpisode: {
            id: episode.id,

            title: episode.title,

            episodeNo: episode.episodeNo,

            duration: episode.duration,

            videoUrl: episode.videoUrl,
          },

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
      } else {
        const current = seriesMap.get(series.id);

        if (episode.episodeNo > current.latestEpisode.episodeNo) {
          current.latestEpisode = {
            id: episode.id,

            title: episode.title,

            episodeNo: episode.episodeNo,

            duration: episode.duration,

            videoUrl: episode.videoUrl,
          };
        }
      }
    });

    let result = Array.from(seriesMap.values());

    // newest broadcast episode first
    result.sort(
      (a, b) => b.latestEpisode.episodeNo - a.latestEpisode.episodeNo,
    );

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
