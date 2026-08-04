import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [
      totalChannels,
      totalMovies,
      totalUsers,
      liveStreams,
      channels,
      recentChannels,
      recentSessions,
    ] = await Promise.all([
      prisma.channel.count(),

      prisma.movie.count(),

      prisma.user.count(),

      prisma.broadcastSession.count({
        where: {
          status: "LIVE",
        },
      }),

      prisma.channel.findMany({
        select: {
          id: true,
          name: true,
          streamKey: true,

          broadcastSessions: {
            orderBy: {
              createdAt: "desc",
            },

            take: 1,

            select: {
              status: true,
            },
          },
        },
      }),

      prisma.channel.findMany({
        orderBy: {
          createdAt: "desc",
        },

        take: 5,

        select: {
          name: true,
          createdAt: true,
        },
      }),

      prisma.broadcastSession.findMany({
        orderBy: {
          createdAt: "desc",
        },

        take: 5,

        select: {
          status: true,
          createdAt: true,
          channel: {
            select: {
              name: true,
            },
          },
        },
      }),
    ]);

    return NextResponse.json({
      stats: {
        totalChannels,

        liveStreams,

        movies: totalMovies,

        users: totalUsers,
      },

      channels: channels.map((channel) => ({
        name: channel.name,

        status: channel.broadcastSessions[0]?.status ?? "STOPPED",
      })),

      activities: [
        ...recentChannels.map((c) => ({
          message: `Added channel ${c.name}`,

          time: c.createdAt,
        })),

        ...recentSessions.map((s) => ({
          message: `${s.channel.name} broadcast ${s.status.toLowerCase()}`,

          time: s.createdAt,
        })),
      ],
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: "Dashboard error",
      },

      {
        status: 500,
      },
    );
  }
}
