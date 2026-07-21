import { Stream } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export class LivePipelineManager {
  private running = new Map<number, Stream>();

  async start(channelId: number, stream: Stream) {
    console.log("🔴 Register LIVE", stream.name);

    this.running.set(channelId, stream);

    return true;
  }

  async stop(channelId: number) {
    console.log("🛑 Remove LIVE", channelId);

    this.running.delete(channelId);
  }

  getStream(channelId: number) {
    return this.running.get(channelId);
  }

  isRunning(channelId: number) {
    return this.running.has(channelId);
  }

  async hasPublisher(channelId: number) {
    const stream = this.running.get(channelId);

    if (!stream) {
      return false;
    }

    const channel = await prisma.channel.findUnique({
      where: {
        id: stream.channelId,
      },
    });

    if (!channel?.streamKey) {
      return false;
    }

    try {
      const res = await fetch(
        `http://127.0.0.1:9997/v3/paths/get/live/${channel.streamKey}`,
      );

      if (!res.ok) {
        return false;
      }

      const data = await res.json();

      return data.item?.ready === true;
    } catch {
      return false;
    }
  }
}
