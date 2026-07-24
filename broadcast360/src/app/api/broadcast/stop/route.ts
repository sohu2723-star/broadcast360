import { NextResponse } from "next/server";

import { BroadcastService } from "@/services/broadcast.service";

const broadcast = globalThis.broadcastService ?? new BroadcastService();

globalThis.broadcastService = broadcast;

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const channelId = Number(body.channelId);

    if (!channelId) {
      return NextResponse.json(
        {
          error: "channelId required",
        },
        {
          status: 400,
        },
      );
    }

    await broadcast.stop(channelId);

    return NextResponse.json({
      success: true,

      message: "Broadcast stopped",

      channelId,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "stop failed",
      },
      {
        status: 500,
      },
    );
  }
}
