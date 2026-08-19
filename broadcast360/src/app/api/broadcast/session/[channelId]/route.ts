import { NextResponse } from "next/server";
import { BroadcastSessionRepository } from "@/repositories/broadcast-session.repository";
import { MediaMTXManager } from "@/managers/mediamtx.manager";

const mediaMTX = new MediaMTXManager();

type RouteContext = {
  params: Promise<{ channelId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { channelId } = await context.params;
    const id = Number(channelId);

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json(
        { error: "Invalid channel id" },
        { status: 400 },
      );
    }

    const session = await BroadcastSessionRepository.findByChannel(id);

    if (!session) {
      return NextResponse.json({ data: null });
    }

    const mtxHealth = await mediaMTX.getStreamHealth(`channel-${id}`);

    return NextResponse.json({
      data: {
        ...session,
        health: {
          ffmpeg: session.status === "LIVE" ? "Running" : "Stopped",
          mediaMTX: mtxHealth.mediaMTX,
          rtmp: mtxHealth.source,
          hls: mtxHealth.hls,
          readersCount: mtxHealth.readersCount,
        },
      },
    });
  } catch (error) {
    console.error("GET BROADCAST SESSION ERROR", error);
    return NextResponse.json(
      { error: "Failed loading broadcast session" },
      { status: 500 },
    );
  }
}
