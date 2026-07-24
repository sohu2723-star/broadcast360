import { NextResponse } from "next/server";

import { broadcast } from "@/services/broadcast-container";
import { ScheduleRepository } from "@/repositories/schedule.repository";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    /*
    ==========================
       GET CHANNEL ID
    ==========================
    */

    const { channelId: rawChannelId } = body;

    const channelId = Number(rawChannelId);

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
       CHECK CURRENT SCHEDULE
       BY CURRENT TIME
    ==========================
    */

    const now = new Date();

    const schedule = await ScheduleRepository.findLiveSchedule(channelId, now);

    console.log("🔎 CURRENT SCHEDULE CHECK", {
      channelId,
      scheduleId: schedule?.id ?? null,
      time: now,
    });

    /*
    ==========================
       START BROADCAST
    ==========================
    */

    await broadcast.start(schedule, channelId);

    /*
    ==========================
       RESPONSE
    ==========================
    */

    return NextResponse.json({
      success: true,

      channelId,

      schedule: schedule?.id ?? null,

      mode: schedule ? "SCHEDULE" : "FALLBACK",
    });
  } catch (error) {
    console.error("❌ Broadcast start failed", error);

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
