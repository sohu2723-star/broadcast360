import { prisma } from "@/lib/prisma";
import { MediaMTXManager } from "@/managers/mediamtx.manager"; // Adjust path as needed

const mediaMTX = new MediaMTXManager();

export class SessionManager {
  /*
  ===============================
        CREATE / START SESSION
  ===============================
  */

  async start(channelId: number, scheduleId: number | null) {
    console.log(" SESSION START", {
      channelId,
      scheduleId,
    });

    const session = await prisma.broadcastSession.upsert({
      where: {
        channelId,
      },

      update: {
        scheduleId,

        status: "STARTING",

        startedAt: new Date(),

        stoppedAt: null,

        errorMessage: null,
      },

      create: {
        channelId,

        scheduleId,

        status: "STARTING",

        startedAt: new Date(),
      },
    });

    return session;
  }

  /*
  ===============================
        CHANGE LIVE
  ===============================
  */

  async live(channelId: number) {
    return prisma.broadcastSession.update({
      where: {
        channelId,
      },

      data: {
        status: "LIVE",
      },
    });
  }

  /*
  ===============================
        SWITCHING
  ===============================
  */

  async switching(channelId: number) {
    return prisma.broadcastSession.update({
      where: {
        channelId,
      },

      data: {
        status: "SWITCHING",
      },
    });
  }

  /*
  ===============================
        STOP
  ===============================
  */

  async stop(channelId: number) {
    const session = await this.get(channelId);

    if (!session) {
      return null;
    }

    return prisma.broadcastSession.update({
      where: {
        channelId,
      },

      data: {
        status: "STOPPED",
        stoppedAt: new Date(),
      },
    });
  }

  /*
  ===============================
        ERROR
  ===============================
  */

  async error(channelId: number, message: string) {
    return prisma.broadcastSession.update({
      where: {
        channelId,
      },

      data: {
        status: "ERROR",

        errorMessage: message,
      },
    });
  }

  /*
  ===============================
        GET SESSION
  ===============================
  */

  async get(channelId: number) {
    return prisma.broadcastSession.findUnique({
      where: {
        channelId,
      },
    });
  }

  /*
  ===============================
        CHECK LIVE
  ===============================
  */

  async isLive(channelId: number) {
    const session = await this.get(channelId);

    return session?.status === "LIVE";
  }

  /*
  ===============================
        GET SESSION WITH HEALTH (ADDITION)
  ===============================
  */

  async getWithHealth(channelId: number) {
    const session = await this.get(channelId);

    if (!session) {
      return null;
    }

    // Query path metrics from MediaMTX
    const mtxHealth = await mediaMTX.getStreamHealth(`channel-${channelId}`);

    return {
      ...session,
      health: {
        ffmpeg: session.status === "LIVE" ? "Running" : "Stopped",
        mediaMTX: mtxHealth.mediaMTX,
        rtmp: mtxHealth.source,
        hls: mtxHealth.hls,
        readersCount: mtxHealth.readersCount,
      },
    };
  }
}