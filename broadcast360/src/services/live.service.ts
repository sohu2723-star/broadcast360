import { prisma } from "@/lib/prisma";

export class LiveService {
  async start(channelId: number) {
    const channel = await prisma.channel.findUnique({
      where: {
        id: channelId,
      },
    });

    if (!channel) {
      throw new Error("Channel not found");
    }

    if (!channel.streamKey) {
      throw new Error("Channel stream key missing");
    }

    // check already live

    const existing = await prisma.broadcastSession.findFirst({
      where: {
        channelId,
        status: "LIVE",
      },
    });

    if (existing) {
      throw new Error("Channel already live");
    }

    const session = await prisma.broadcastSession.create({
      data: {
        channelId,

        status: "LIVE",

        startedAt: new Date(),
      },
    });

    const ingestUrl = `rtmp://localhost:1935/live/${channel.streamKey}`;

    const hlsUrl = `http://localhost:8888/live/${channel.streamKey}/index.m3u8`;

    const webRtcUrl = `http://localhost:8889/live/${channel.streamKey}`;

    return {
      session,

      channel: {
        id: channel.id,
        name: channel.name,
      },

      streamKey: channel.streamKey,

      ingest: {
        rtmp: ingestUrl,
      },

      playback: {
        hls: hlsUrl,

        webrtc: webRtcUrl,
      },
    };
  }
}
