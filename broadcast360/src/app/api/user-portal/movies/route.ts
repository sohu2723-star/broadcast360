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

    const movies = schedules.flatMap((schedule) =>
      schedule.playlist.items
        .filter((item) => item.movie !== null)

        .map((item) => ({
          id: item.movie!.id,

          movieKey: `${item.movie!.id}-${schedule.channel.id}-${schedule.id}`,

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

          channelId: schedule.channel.id,

          channelName: schedule.channel.name,

          scheduleId: schedule.id,

          scheduleStart: schedule.startTime,

          scheduleEnd: schedule.endTime,
        })),
    );

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
    console.error("USER MOVIES API ERROR:", error);

    return NextResponse.json(
      {
        message: "Failed to fetch movies",
      },
      {
        status: 500,

        headers: {
          "Access-Control-Allow-Origin": "http://localhost:3001",
        },
      },
    );
  }
}
