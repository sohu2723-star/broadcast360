import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolveMediaUrl } from "@/lib/media/url";
import { getPortalCorsHeaders } from "@/lib/portal-cors";

interface Params {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: Request, { params }: Params) {
  try {
    const origin = new URL(request.url).origin;
    const corsHeaders = getPortalCorsHeaders(request);
    const { id } = await params;

    const seriesId = Number(id);

    if (isNaN(seriesId)) {
      return NextResponse.json(
        {
          message: "Invalid series id",
        },
        {
          status: 400,
        },
      );
    }

    // Get current series

    const currentSeries = await prisma.series.findUnique({
      where: {
        id: seriesId,
      },

      select: {
        genre: true,
      },
    });

    if (!currentSeries) {
      return NextResponse.json(
        {
          message: "Series not found",
        },
        {
          status: 404,
        },
      );
    }

    // Find related series
    const related = await prisma.series.findMany({
      where: {
        id: {
          not: seriesId,
        },
        genre: currentSeries.genre,
      },

      take: 8,

      orderBy: {
        createdAt: "desc",
      },

      include: {
        episodes: {
          orderBy: {
            episodeNo: "desc",
          },

          take: 1,

          include: {
            playlistItems: {
              include: {
                playlist: {
                  include: {
                    schedules: {
                      orderBy: {
                        endTime: "desc",
                      },

                      take: 1,

                      include: {
                        channel: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
    const result = related.map((item) => {
      const latestEpisode = item.episodes[0];
      const schedule = latestEpisode?.playlistItems[0]?.playlist?.schedules[0];

      return {
        id: item.id,

        title: item.title,

        description: item.description,

        genre: item.genre,

        releaseYear: item.releaseYear,

        thumbnail: resolveMediaUrl(item.thumbnail, origin),

        latestEpisode: latestEpisode
          ? {
              episodeNo: latestEpisode.episodeNo,

              channel: schedule
                ? {
                    id: schedule.channel.id,
                    name: schedule.channel.name,
                  }
                : null,
            }
          : null,
      };
    });

    return NextResponse.json(
      {
        series: result,
      },
      {
        status: 200,
        headers: {
          ...corsHeaders,
        },
      },
    );
  } catch (error) {
    console.error("RELATED SERIES ERROR:", error);

    return NextResponse.json(
      {
        message: "Failed to fetch related series",
      },

      {
        status: 500,
      },
    );
  }
}
