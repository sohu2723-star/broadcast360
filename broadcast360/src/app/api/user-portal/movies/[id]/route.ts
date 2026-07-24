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

    // movieKey format:
    // movieId-channelId
    // example: 10-2

    const movieId = Number(id.split("-")[0]);

    if (Number.isNaN(movieId)) {
      return NextResponse.json(
        {
          message: "Invalid movie id",
        },
        {
          status: 400,
        },
      );
    }

    const movie = await prisma.movie.findUnique({
      where: {
        id: movieId,
      },

      include: {
        playlistItems: {
          include: {
            playlist: {
              include: {
                schedules: {
                  include: {
                    channel: true,
                  },
                },

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
              },
            },
          },
        },
      },
    });

    if (!movie) {
      return NextResponse.json(
        {
          message: "Movie not found",
        },
        {
          status: 404,
        },
      );
    }

    const playlist = movie.playlistItems[0]?.playlist;

    const schedule = playlist?.schedules[0];

    // Playlist Part 1,2,3

    const playlistMovies =
      playlist?.items

        .filter((item) => item.movie !== null)

        .map((item) => ({
          id: item.movie!.id,

          movieKey: `${item.movie!.id}-${schedule?.channel.id}`,

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

    // Related movies same channel only

    const playlistIds = playlistMovies.map((item) => item.id);

    const relatedMovies = await prisma.movie.findMany({
      where: {
        id: {
          notIn: playlistIds,
        },

        playlistItems: {
          some: {
            playlist: {
              schedules: {
                some: {
                  channelId: schedule?.channel.id,
                },
              },
            },
          },
        },
      },

      take: 10,
    });

    return NextResponse.json({
      movie: {
        id: movie.id,

        movieKey: `${movie.id}-${schedule?.channel.id}`,

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

        channelId: schedule?.channel.id ?? null,

        channelName: schedule?.channel.name ?? null,
      },

      playlist: playlistMovies,

      relatedMovies: relatedMovies.map((item) => ({
        id: item.id,

        movieKey: `${item.id}-${schedule?.channel.id}`,

        title: item.title,

        description: item.description,

        genre: item.genre,

        thumbnail: item.thumbnail
          ? `http://localhost:3000${item.thumbnail}`
          : null,

        videoUrl: item.videoUrl,

        duration: item.duration,

        releaseYear: item.releaseYear,

        channelId: schedule?.channel.id ?? null,

        channelName: schedule?.channel.name ?? null,
      })),
    });
  } catch (error) {
    console.error("DETAIL MOVIE ERROR", error);

    return NextResponse.json(
      {
        message: "Failed fetch movie",
      },
      {
        status: 500,
      },
    );
  }
}
