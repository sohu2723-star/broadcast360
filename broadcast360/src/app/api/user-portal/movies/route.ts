import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const now = new Date();

    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const schedules = await prisma.schedule.findMany({
      where: {
        endTime: {
          lte: now,
          gte: oneMonthAgo,
        },
      },

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

    const movies = schedules
      .filter((schedule) => schedule.playlist.items.length > 0)

      .map((schedule) => {
        const partOne = schedule.playlist.items[0];

        const movie = partOne.movie;

        return {
          id: schedule.playlist.id,

          movieKey: `${schedule.playlist.id}-${schedule.id}`,

          // Playlist
          playlistId: schedule.playlist.id,

          playlistName: schedule.playlist.name,

          title: schedule.playlist.name,

          description: movie?.description ?? null,

          // Part 1 Thumbnail
          thumbnail: movie?.thumbnail
            ? `http://localhost:3000${movie.thumbnail}`
            : null,

          // Part 1 Information
          genre: movie?.genre ?? "Movie",

          releaseYear: movie?.releaseYear ?? null,

          duration: movie?.duration ?? 0,

          // Channel
          channelId: schedule.channel.id,

          channelName: schedule.channel.name,

          // Schedule
          scheduleEnd: schedule.endTime,
        };
      });

    return NextResponse.json(
      {
        movies,
      },
      {
        status: 200,

        headers: {
          "Access-Control-Allow-Origin": "http://localhost:3001",

          "Access-Control-Allow-Methods": "GET, OPTIONS",

          "Access-Control-Allow-Headers": "Content-Type",
        },
      },
    );
  } catch (error) {
    console.error("MOVIE API ERROR:", error);

    return NextResponse.json(
      {
        message: "Failed to fetch movies",
      },
      {
        status: 500,
      },
    );
  }
}
