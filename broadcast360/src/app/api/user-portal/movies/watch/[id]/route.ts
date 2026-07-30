import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Context {
  params: Promise<{
    id: string;
  }>;
}

function mediaUrl(path: string | null) {
  if (!path) return null;

  return path.startsWith("http") ? path : `http://localhost:3000${path}`;
}

export async function GET(request: NextRequest, context: Context) {
  try {
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

      thumbnail: mediaUrl(firstMovie.thumbnail),

      videoUrl: mediaUrl(firstMovie.videoUrl),

      duration: firstMovie.duration,

      // Channel

      channelId: schedule?.channel?.id ?? null,

      channelName: schedule?.channel?.name ?? "-",

      channelLogo: mediaUrl(schedule?.channel?.logo ?? null),

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

      thumbnail: mediaUrl(item.movie?.thumbnail ?? null),

      videoUrl: mediaUrl(item.movie?.videoUrl ?? null),

      duration: item.movie?.duration ?? 0,

      channelId: schedule?.channel?.id ?? null,

      channelName: schedule?.channel?.name ?? "-",

      channelLogo: mediaUrl(schedule?.channel?.logo ?? null),

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

          thumbnail: mediaUrl(relatedMovie?.thumbnail ?? null),

          duration: relatedMovie?.duration ?? 0,

          channelId: relatedSchedule?.channel?.id ?? null,

          channelName: relatedSchedule?.channel?.name ?? "-",

          channelLogo: mediaUrl(relatedSchedule?.channel?.logo ?? null),
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
