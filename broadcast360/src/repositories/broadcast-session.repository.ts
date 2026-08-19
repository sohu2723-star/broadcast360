import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";

export class BroadcastSessionRepository {
  static create(data: Prisma.BroadcastSessionCreateInput) {
    return prisma.broadcastSession.create({
      data,
    });
  }

  static findActive(channelId: number) {
    return prisma.broadcastSession.findFirst({
      where: {
        channelId,

        status: {
          in: ["STARTING", "LIVE", "SWITCHING"],
        },
      },
    });
  }

  static updateStatus(
    id: number,
    status:
      "STARTING" | "LIVE" | "SWITCHING" | "STOPPING" | "STOPPED" | "ERROR",
  ) {
    return prisma.broadcastSession.update({
      where: {
        id,
      },

      data: {
        status,
      },
    });
  }

  static stop(id: number) {
    return prisma.broadcastSession.update({
      where: {
        id,
      },

      data: {
        status: "STOPPED",

        stoppedAt: new Date(),
      },
    });
  }

  static findAll() {
    return prisma.broadcastSession.findMany({
      include: {
        channel: {
          select: {
            id: true,
            name: true,
            streamKey: true,
          },
        },

        schedule: {
          include: {
            playlist: true,
          },
        },
      },

      orderBy: {
        channelId: "asc",
      },
    });
  }

  static findByChannel(channelId: number) {
    return prisma.broadcastSession.findUnique({
      where: {
        channelId,
      },

      include: {
        channel: {
          select: {
            id: true,
            name: true,
            streamKey: true,
          },
        },

        schedule: {
          include: {
            playlist: true,
          },
        },
      },
    });
  }
}
