import { NextResponse } from "next/server";
import { ScheduleRepository } from "@/repositories/schedule.repository";
import { BroadcastService } from "@/services/broadcast.service";
import { SchedulerManager } from "@/managers/scheduler.manager";

const broadcast = new BroadcastService();
const scheduler = new SchedulerManager();

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

    const schedule = await ScheduleRepository.findLiveSchedule(
      channelId,
      new Date(),
    );

    /*
      Start scheduler
    */

    if (!scheduler.isRunning(channelId)) {
      scheduler.start(channelId);
    }

    /*
      Start first broadcast
    */

    if (!broadcast.isRunning(channelId)) {
      console.log("▶ Initial broadcast start");

      await broadcast.start(schedule, channelId);
    } else {
      console.log("⚠ FFmpeg already running");
    }

    return NextResponse.json({
      success: true,

      message: "Broadcast started",

      channelId,
    });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      {
        error: "Internal error",
      },
      {
        status: 500,
      },
    );
  }
}
