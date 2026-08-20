import { NextResponse } from "next/server";

import { scheduler } from "@/services/scheduler-container";
import { broadcast } from "@/services/broadcast-container";

export async function POST(request: Request) {
  try {
    const body = await request.json();

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

    /*
    ==========================
        STOP BROADCAST
    ==========================
    */

    await broadcast.stop(channelId);

    /*
    ==========================
        STOP SCHEDULER TIMER
    ==========================
    */

    scheduler.stop(channelId);

    return NextResponse.json({
      success: true,

      channelId,
    });
  } catch (error) {
    console.error(" Broadcast stop failed", error);

    return NextResponse.json(
      {
        error: "Broadcast stop failed",
      },
      {
        status: 500,
      },
    );
  }
}
