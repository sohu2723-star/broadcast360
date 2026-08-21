import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolveMediaUrl } from "@/lib/media/url";
import { getPortalCorsHeaders } from "@/lib/portal-cors";
import { verifyUserToken } from "@/lib/user-jwt";
import { getVodEntitlement, redeemCreditForContent } from "@/services/vod-entitlement.service";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const origin = new URL(req.url).origin;
    const corsHeaders = getPortalCorsHeaders(req);
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

    let userId: number | null = null;
    let premiumAccess = false;
    const userToken = req.cookies.get("user_token")?.value;
    if (userToken) {
      try {
        const payload = await verifyUserToken(userToken);
        userId = Number(payload.id);
        premiumAccess = (await getVodEntitlement(userId)).isPremium;
      } catch {
        userId = null;
      }
    }

    const availableEpisodes = series.episodes.filter((episode) =>
      episode.playlistItems.some((item) => item.playlist.schedules.length > 0),
    );

    const episodeMap = new Map<number, any>();

    for (const episode of availableEpisodes) {
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

      const accessType = episode.accessType ?? "FREE";
      let canView = accessType === "FREE" || premiumAccess;
      if (!canView && userId) {
        canView = await redeemCreditForContent(userId, `episode:${episode.id}`);
      }

      episodeMap.get(episode.episodeNo).parts.push({
        id: episode.id,
        title: episode.title,
        duration: episode.duration,
        accessType,
        thumbnail: resolveMediaUrl(episode.thumbnailUrl, origin),
        videoUrl: canView ? resolveMediaUrl(episode.hdVideoUrl ?? episode.standardVideoUrl ?? episode.videoUrl, origin) : null,
      });
    }

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

        thumbnail: resolveMediaUrl(series.thumbnail, origin),

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
        headers: getPortalCorsHeaders(req),
      },
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: getPortalCorsHeaders(),
  });
}
