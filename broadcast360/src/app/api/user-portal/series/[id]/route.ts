import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const corsHeaders = {
  "Access-Control-Allow-Origin": "http://localhost:3001",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const seriesId = Number(id);

    if (isNaN(seriesId)) {
      return NextResponse.json(
        {
          message: "Invalid series id",
        },
        {
          status: 400,
          headers: corsHeaders,
        },
      );
    }

    const now = new Date();
    const availableTime = new Date(
      now.getTime() + 6.5 * 60 * 60 * 1000 - 60 * 60 * 1000,
    );
    const oneMonthAgo = new Date(now.getTime() + 6.5 * 60 * 60 * 1000);
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const series = await prisma.series.findUnique({
      where: {
        id: seriesId,
      },

      include: {
        episodes: {
          include: {
            playlistItems: {
              include: {
                playlist: {
                  include: {
                    schedules: {
                      where: {
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
                    },
                  },
                },
              },
            },
          },

          orderBy: {
            episodeNo: "desc",
          },
        },
      },
    });

    if (!series) {
      return NextResponse.json(
        {
          message: "Series not found",
        },
        {
          status: 404,
          headers: corsHeaders,
        },
      );
    }

    const availableEpisodes = series.episodes.filter((episode) =>
      episode.playlistItems.some((item) => item.playlist.schedules.length > 0),
    );

    const episodeMap = new Map<number, any>();

    availableEpisodes.forEach((episode) => {
      const schedule = episode.playlistItems[0].playlist.schedules[0];

      if (!episodeMap.has(episode.episodeNo)) {
        episodeMap.set(episode.episodeNo, {
          id: episode.id,

          episodeNo: episode.episodeNo,

          title: `Episode ${episode.episodeNo}`,

          channel: {
            id: schedule.channel.id,
            name: schedule.channel.name,
          },

          schedule: {
            id: schedule.id,
            startTime: schedule.startTime,
            endTime: schedule.endTime,
          },

          parts: [],
        });
      }

      episodeMap.get(episode.episodeNo).parts.push({
        id: episode.id,

        title: episode.title,

        duration: episode.duration,

        thumbnail: episode.thumbnailUrl
          ? `http://localhost:3000${episode.thumbnailUrl}`
          : null,

        videoUrl: episode.videoUrl,
      });
    });

    const episodes = Array.from(episodeMap.values()).sort(
      (a, b) => a.episodeNo - b.episodeNo,
    );

    if (episodes.length === 0) {
      return NextResponse.json(
        {
          message: "No available episodes",
        },
        {
          status: 404,
          headers: corsHeaders,
        },
      );
    }

    return NextResponse.json(
      {
        id: series.id,

        title: series.title,

        description: series.description,

        genre: series.genre,

        releaseYear: series.releaseYear,

        thumbnail: series.thumbnail
          ? `http://localhost:3000${series.thumbnail}`
          : null,

        latestEpisode: episodes[episodes.length - 1],

        episodes,
      },
      {
        status: 200,
        headers: corsHeaders,
      },
    );
  } catch (error) {
    console.error("SERIES DETAIL ERROR:", error);

    return NextResponse.json(
      {
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
