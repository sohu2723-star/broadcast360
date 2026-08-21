import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolveMediaUrl } from "@/lib/media/url";

interface Context {
  params: Promise<{
    id: string;
  }>;
}


export async function GET(request: NextRequest, context: Context) {
  try {
    const origin = request.nextUrl.origin;
    const { id } = await context.params;

    const playlistId = Number(id);

    if (Number.isNaN(playlistId)) {
      return NextResponse.json(
        {
          message: "Invalid playlist id",
        },
        {
          status: 400,
        },
      );
    }

    const playlist = await prisma.playlist.findUnique({
      where: {
        id: playlistId,
      },

      include: {
        items: {
          where: {
            type: "MOVIE",
          },

          include: {
            movie: true,
          },

          orderBy: {
            order: "asc",
          },
        },

        schedules: {
          include: {
            channel: true,
          },
        },
      },
    });

    if (!playlist || playlist.items.length === 0) {
      return NextResponse.json(
        {
          message: "Playlist not found",
        },
        {
          status: 404,
        },
      );
    }

    const schedule = playlist.schedules[0];

    const firstMovie = playlist.items[0]?.movie;

    if (!firstMovie) {
      return NextResponse.json(
        {
          message: "Movie not found",
        },
        {
          status: 404,
        },
      );
    }

    /*
      MAIN MOVIE
    */

    const movie = {
      id: firstMovie.id,

      movieKey: String(playlist.id),

      playlistId: playlist.id,

      playlistName: playlist.name,

      title: firstMovie.title,

      description: firstMovie.description,

      genre: firstMovie.genre,

      releaseYear: firstMovie.releaseYear,

      thumbnail: resolveMediaUrl(firstMovie.thumbnail, origin),

      accessType: firstMovie.accessType ?? "FREE",

      standardVideoUrl: resolveMediaUrl(
        firstMovie.standardVideoUrl ?? firstMovie.videoUrl,
        origin,
      ),

      hdVideoUrl: resolveMediaUrl(
        firstMovie.hdVideoUrl ?? firstMovie.videoUrl,
        origin,
      ),

      videoUrl: resolveMediaUrl(
        firstMovie.standardVideoUrl ?? firstMovie.videoUrl,
        origin,
      ),

      duration: firstMovie.duration,

      // Channel

      channelId: schedule?.channel?.id ?? null,

      channelName: schedule?.channel?.name ?? "-",

      channelLogo: resolveMediaUrl(schedule?.channel?.logo ?? null, origin),

      // Schedule

      scheduleId: schedule?.id ?? null,

      scheduleStart: schedule?.startTime ?? null,

      scheduleEnd: schedule?.endTime ?? null,
    };

    /*
      PLAYLIST PARTS
    */

    const playlistItems = playlist.items.map((item) => ({
      id: item.movie?.id ?? item.id,

      movieKey: String(item.movie?.id ?? item.id),

      playlistId: playlist.id,

      playlistName: playlist.name,

      title: item.movie?.title ?? "",

      description: item.movie?.description ?? null,

      genre: item.movie?.genre ?? null,

      releaseYear: item.movie?.releaseYear ?? null,

      thumbnail: resolveMediaUrl(item.movie?.thumbnail ?? null, origin),

      accessType: item.movie?.accessType ?? "FREE",

      standardVideoUrl: resolveMediaUrl(
        item.movie?.standardVideoUrl ?? item.movie?.videoUrl ?? null,
        origin,
      ),

      hdVideoUrl: resolveMediaUrl(
        item.movie?.hdVideoUrl ?? item.movie?.videoUrl ?? null,
        origin,
      ),

      videoUrl: resolveMediaUrl(
        item.movie?.standardVideoUrl ?? item.movie?.videoUrl ?? null,
        origin,
      ),

      duration: item.movie?.duration ?? 0,

      channelId: schedule?.channel?.id ?? null,

      channelName: schedule?.channel?.name ?? "-",

      channelLogo: resolveMediaUrl(schedule?.channel?.logo ?? null, origin),

      scheduleStart: schedule?.startTime ?? null,

      scheduleEnd: schedule?.endTime ?? null,
    }));

    /*
      RELATED MOVIES
    */

    const currentChannelId = schedule?.channel?.id;

    const relatedPlaylists = await prisma.playlist.findMany({
      where: {
        id: {
          not: playlist.id,
        },

        items: {
          some: {
            movie: {
              genre: firstMovie.genre,
            },
          },
        },
      },

      include: {
        items: {
          where: {
            type: "MOVIE",
          },

          include: {
            movie: true,
          },

          orderBy: {
            order: "asc",
          },

          take: 1,
        },

        schedules: {
          include: {
            channel: true,
          },
        },
      },

      take: 50,
    });

    const relatedMovies = relatedPlaylists

      .filter((item) => {
        const channelId = item.schedules[0]?.channel?.id;

        return channelId !== currentChannelId;
      })

      .sort(() => Math.random() - 0.5)

      .slice(0, 10)

      .map((item) => {
        const relatedMovie = item.items[0]?.movie;

        const relatedSchedule = item.schedules[0];

        return {
          id: item.id,

          movieKey: String(item.id),

          playlistId: item.id,

          playlistName: item.name,

          title: relatedMovie?.title ?? item.name,

          genre: relatedMovie?.genre ?? "Movie",

          releaseYear: relatedMovie?.releaseYear ?? null,

          thumbnail: resolveMediaUrl(relatedMovie?.thumbnail, origin),

          duration: relatedMovie?.duration ?? 0,

          channelId: relatedSchedule?.channel?.id ?? null,

          channelName: relatedSchedule?.channel?.name ?? "-",

          channelLogo: resolveMediaUrl(relatedSchedule?.channel?.logo ?? null, origin),
        };
      });

    return NextResponse.json({
      movie,

      playlist: playlistItems,

      relatedMovies,
    });
  } catch (error) {
    console.error("WATCH MOVIE API ERROR:", error);

    return NextResponse.json(
      {
        message: "Failed to load movie",
      },
      {
        status: 500,
      },
    );
  }
}
