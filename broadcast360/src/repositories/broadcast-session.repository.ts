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
    status: "STARTING" | "LIVE" | "SWITCHING" | "STOPPED" | "ERROR",
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
}
