import { NextResponse } from "next/server";

import { ScheduleRepository } from "@/repositories/schedule.repository";

import { BroadcastService } from "@/services/broadcast.service";

import { SchedulerManager } from "@/managers/scheduler.manager";

const broadcast = globalThis.broadcastService ?? new BroadcastService();

const scheduler = globalThis.schedulerManager ?? new SchedulerManager();

globalThis.broadcastService = broadcast;

globalThis.schedulerManager = scheduler;

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
      Start scheduler loop
    */

    if (!scheduler.isRunning(channelId)) {
      scheduler.start(channelId);
    }

    /*
      Start broadcast first time
    */

    if (!broadcast.isRunning(channelId)) {
      console.log("▶ Initial broadcast start");

      await broadcast.start(schedule, channelId);
    } else {
      console.log("⚠ Broadcast already running");
    }

    return NextResponse.json({
      success: true,

      message: "Broadcast started",

      channelId,
    });
  } catch (error) {
    console.error(error);

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
