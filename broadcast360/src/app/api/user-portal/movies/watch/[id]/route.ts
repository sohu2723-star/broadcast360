import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Context {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: NextRequest, context: Context) {
  try {
    const { id } = await context.params;

    const playlistItemId = Number(id);

    if (Number.isNaN(playlistItemId)) {
      return NextResponse.json(
        {
          message: "Invalid playlist item id",
        },
        {
          status: 400,
        },
      );
    }

    const playlistItem = await prisma.playlistItem.findUnique({
      where: {
        id: playlistItemId,
      },

      include: {
        movie: true,

        playlist: {
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
        },
      },
    });

    if (!playlistItem || !playlistItem.movie) {
      return NextResponse.json(
        {
          message: "Movie not found",
        },
        {
          status: 404,
        },
      );
    }

    const movie = playlistItem.movie;

    const schedule = playlistItem.playlist?.schedules[0];

    // =========================
    // PLAYLIST ONLY
    // =========================

    const playlistMovies =
      playlistItem.playlist?.items

        .filter((item) => item.movie !== null)

        .map((item) => ({
          id: item.movie!.id,

          movieKey: String(item.movie!.id),

          title: item.movie!.title,

          description: item.movie!.description,

          genre: item.movie!.genre,

          thumbnail: item.movie!.thumbnail
            ? `http://localhost:3000${item.movie!.thumbnail}`
            : null,

          videoUrl: item.movie!.videoUrl
            ? item.movie!.videoUrl.startsWith("http")
              ? item.movie!.videoUrl
              : `http://localhost:3000${item.movie!.videoUrl}`
            : null,

          duration: item.movie!.duration,

          releaseYear: item.movie!.releaseYear,

          playlistId: item.playlistId,

          playlistItemId: item.id,

          playlistOrder: item.order,

          channelId: schedule?.channel.id ?? null,

          channelName: schedule?.channel.name ?? null,
        })) ?? [];

    return NextResponse.json({
      movie: {
        id: movie.id,

        movieKey: String(movie.id),

        title: movie.title,

        description: movie.description,

        genre: movie.genre,

        thumbnail: movie.thumbnail
          ? `http://localhost:3000${movie.thumbnail}`
          : null,

        videoUrl: movie.videoUrl
          ? movie.videoUrl.startsWith("http")
            ? movie.videoUrl
            : `http://localhost:3000${movie.videoUrl}`
          : null,

        duration: movie.duration,

        releaseYear: movie.releaseYear,

        playlistId: playlistItem.playlistId,

        playlistItemId: playlistItem.id,

        playlistOrder: playlistItem.order,

        channelId: schedule?.channel.id ?? null,

        channelName: schedule?.channel.name ?? null,
      },

      // Part 1, Part 2, Part 3 only

      playlist: playlistMovies,
    });
  } catch (error) {
    console.error("WATCH MOVIE API ERROR:", error);

    return NextResponse.json(
      {
        message: "Failed to load video",
      },
      {
        status: 500,
      },
    );
  }
}
