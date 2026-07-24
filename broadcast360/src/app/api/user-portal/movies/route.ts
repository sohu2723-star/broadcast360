import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const schedules = await prisma.schedule.findMany({
      include: {
        channel: true,

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
          },
        },
      },

      orderBy: {
        endTime: "desc",
      },
    });

    const movies = schedules.flatMap((schedule) =>
      schedule.playlist.items
        .filter((item) => item.movie !== null)

        .map((item) => {
          const movie = item.movie!;

          return {
            id: movie.id,

            // IMPORTANT
            // unique per channel
            movieKey: `${movie.id}-${schedule.channel.id}`,

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

            channelId: schedule.channel.id,

            channelName: schedule.channel.name,

            playlistId: item.playlistId,

            playlistItemId: item.id,

            playlistOrder: item.order,
          };
        }),
    );

    // remove only exact duplicate
    const uniqueMovies = Array.from(
      new Map(
        movies.map((movie) => [`${movie.id}-${movie.channelId}`, movie]),
      ).values(),
    );

    return NextResponse.json({
      movies: uniqueMovies,
    });
  } catch (error) {
    console.error("MOVIE LIST ERROR", error);

    return NextResponse.json(
      {
        message: "Failed loading movies",
      },
      {
        status: 500,
      },
    );
  }
}
