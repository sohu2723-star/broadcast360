import { prisma } from "@/lib/prisma";
import { BroadcastStatus } from "@/generated/prisma/client";

export const BroadcastRepository = {
  findLiveSession: (channelId: number) => {
    return prisma.broadcastSession.findFirst({
      where: {
        channelId,
        status: BroadcastStatus.LIVE,
      },
      include: {
        channel: true,
        schedule: {
          include: {
            playlist: {
              include: {
                items: {
                  include: {
                    movie: true,
                    episode: true,
                    advertisement: true,
                    news: true,
                    stream: true,
                    entertainment: true,
                  },
                  orderBy: { order: "asc" },
                },
              },
            },
          },
        },
      },
    });
  },
};