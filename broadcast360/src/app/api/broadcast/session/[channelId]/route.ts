import { NextResponse } from "next/server";
import { BroadcastSessionRepository } from "@/repositories/broadcast-session.repository";
import { MediaMTXManager } from "@/managers/mediamtx.manager"; // Adjust path if needed

const mediaMTX = new MediaMTXManager();

export async function GET(
  request: Request,
  context: {
    params: Promise<{
      channelId: string;
    }>;
  }
) {
  try {
    const { channelId } = await context.params;
    const id = Number(channelId);

    if (!id) {
      return NextResponse.json(
        { error: "Invalid channel id" },
        { status: 400 }
      );
    }

    const session = await BroadcastSessionRepository.findByChannel(id);

    if (!session) {
      return NextResponse.json({ data: null });
    }

    // ADDITION: Fetch real stream health from MediaMTX
    const mtxHealth = await mediaMTX.getStreamHealth(`channel-${id}`);

    // Return session with added health data
    return NextResponse.json({
      data: {
        ...session,
        health: {
          ffmpeg: session.status === "LIVE" ? "Running" : "Stopped",
          mediaMTX: mtxHealth.mediaMTX,
          rtmp: mtxHealth.rtmp,
          hls: mtxHealth.hls,
          readersCount: mtxHealth.readersCount,
        },
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed loading broadcast session" },
      { status: 500 }
    );
  }
}