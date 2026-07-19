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

    const movieId = Number(id);

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

    const schedule = movie.playlistItems[0]?.playlist?.schedules[0];

    return NextResponse.json({
      movie: {
        id: movie.id,

        title: movie.title,

        description: movie.description,

        genre: movie.genre,

        thumbnail: movie.thumbnail,

        videoUrl: movie.videoUrl,

        duration: movie.duration,

        releaseYear: movie.releaseYear,

        channelId: schedule?.channel.id ?? null,

        channelName: schedule?.channel.name ?? null,

        scheduleId: schedule?.id ?? null,

        scheduleStart: schedule?.startTime ?? null,

        scheduleEnd: schedule?.endTime ?? null,
      },
    });
  } catch (error) {
    console.error("GET MOVIE BY ID ERROR:", error);

    return NextResponse.json(
      {
        message: "Failed to fetch movie",
      },
      {
        status: 500,
      },
    );
  }
}
