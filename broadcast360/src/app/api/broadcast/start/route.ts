import { NextResponse } from "next/server";

import { scheduler } from "@/services/scheduler-container";

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
        START SCHEDULER ONLY
    ==========================
    */

    scheduler.start(channelId);

    return NextResponse.json({
      success: true,
      channelId,
    });
  } catch (error) {
    console.error(" Broadcast start failed", error);

    return NextResponse.json(
      {
        error: "Broadcast start failed",
      },
      {
        status: 500,
      },
    );
  }
}
