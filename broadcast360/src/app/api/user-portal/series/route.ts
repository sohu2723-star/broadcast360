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

    const availableTime = new Date(now.getTime() - 60 * 60 * 1000);

    const oneMonthAgo = new Date();

    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

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
                  endTime: {
                    lte: availableTime,

                    gte: oneMonthAgo,
                  },

                  ...(channelId
                    ? {
                        channelId: Number(channelId),
                      }
                    : {}),
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

    const map = new Map();

    episodes.forEach((episode) => {
      const series = episode.series;

      const schedule = episode.playlistItems[0]?.playlist.schedules[0];

      if (!schedule) return;

      if (!map.has(series.id)) {
        map.set(series.id, {
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
        const current = map.get(series.id);

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

    let result = Array.from(map.values());

    // Hot Series
    // latest added episodes

    if (type === "hot") {
      result = result
        .sort((a, b) => b.latestEpisode.id - a.latestEpisode.id)
        .slice(0, 10);
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
    console.error("SERIES API ERROR", error);

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
