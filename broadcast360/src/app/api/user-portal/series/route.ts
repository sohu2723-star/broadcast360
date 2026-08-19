import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cors, optionsResponse } from "@/lib/cors";

function mediaUrl(value: string | null | undefined, origin: string) {
  if (!value) return null;
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  return new URL(value.startsWith("/") ? value : `/${value}`, origin).toString();
}

function positiveInt(value: string | null, fallback: number, maximum: number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(maximum, Math.max(1, Math.floor(parsed)));
}

export async function GET(req: Request) {
  try {
    const requestUrl = new URL(req.url);
    const search = requestUrl.searchParams.get("search")?.trim() ?? "";
    const channelIdValue = requestUrl.searchParams.get("channelId");
    const channelId = channelIdValue ? Number(channelIdValue) : undefined;
    const type = requestUrl.searchParams.get("type");
    const page = positiveInt(requestUrl.searchParams.get("page"), 1, 10000);
    const limit = positiveInt(requestUrl.searchParams.get("limit"), 20, 50);
    const skip = (page - 1) * limit;
    const origin = requestUrl.origin;

    const availableTime = new Date(Date.now() - 60 * 1000);
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const schedules = await prisma.schedule.findMany({
      where: {
        ...(Number.isFinite(channelId) ? { channelId } : {}),
        endTime: { lte: availableTime, gte: oneMonthAgo },
        playlist: {
          items: {
            some: {
              type: "EPISODE",
              episode: {
                series: {
                  title: { contains: search, mode: "insensitive" },
                },
              },
            },
          },
        },
      },
      select: {
        id: true,
        startTime: true,
        endTime: true,
        channel: { select: { id: true, name: true } },
        playlist: {
          select: {
            items: {
              where: { type: "EPISODE", episodeId: { not: null } },
              orderBy: { order: "desc" },
              select: {
                episode: {
                  select: {
                    id: true,
                    title: true,
                    episodeNo: true,
                    duration: true,
                    videoUrl: true,
                    series: {
                      select: {
                        id: true,
                        title: true,
                        description: true,
                        genre: true,
                        releaseYear: true,
                        thumbnail: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { endTime: "desc" },
    });

    const seriesMap = new Map<number, {
      id: number;
      title: string;
      description: string | null;
      genre: string | null;
      releaseYear: number | null;
      thumbnail: string | null;
      latestEpisode: {
        id: number;
        title: string;
        episodeNo: number;
        duration: number;
        videoUrl: string | null;
      };
      channel: { id: number; name: string };
      schedule: { id: number; startTime: Date; endTime: Date | null };
    }>();

    for (const schedule of schedules) {
      for (const item of schedule.playlist.items) {
        const episode = item.episode;
        if (!episode?.series || !schedule.channel || !schedule.endTime) continue;

        const current = seriesMap.get(episode.series.id);
        if (current && current.latestEpisode.episodeNo >= episode.episodeNo) continue;

        seriesMap.set(episode.series.id, {
          id: episode.series.id,
          title: episode.series.title,
          description: episode.series.description,
          genre: episode.series.genre,
          releaseYear: episode.series.releaseYear,
          thumbnail: mediaUrl(episode.series.thumbnail, origin),
          latestEpisode: {
            id: episode.id,
            title: episode.title,
            episodeNo: episode.episodeNo,
            duration: episode.duration,
            videoUrl: mediaUrl(episode.videoUrl, origin),
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
      }
    }

    let result = Array.from(seriesMap.values()).sort(
      (a, b) => new Date(b.schedule.endTime ?? 0).getTime() - new Date(a.schedule.endTime ?? 0).getTime(),
    );

    if (type === "hot") result = result.slice(0, 10);
    const total = result.length;
    const data = type === "hot" ? result : result.slice(skip, skip + limit);

    const response = NextResponse.json(
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
        headers: {
          "Cache-Control": "public, s-maxage=20, stale-while-revalidate=120",
        },
      },
    );

    return cors(response);
  } catch (error) {
    console.error("SERIES LIST ERROR:", error);
    return cors(
      NextResponse.json(
        { success: false, message: "Failed to fetch series" },
        { status: 500 },
      ),
    );
  }
}

export function OPTIONS() {
  return optionsResponse();
}
