import { NextResponse } from "next/server";

import { SchedulerManager } from "@/managers/scheduler.manager";
import { BroadcastService } from "@/services/broadcast.service";

/*
================================
 SINGLETON ENGINE
================================
*/

const broadcast = globalThis.broadcastService ?? new BroadcastService();

const scheduler =
  globalThis.schedulerManager ?? new SchedulerManager(broadcast);

globalThis.broadcastService = broadcast;

globalThis.schedulerManager = scheduler;

/*
================================
 PREVENT DOUBLE START
================================
*/

const startingChannels = globalThis.startingBroadcasts ?? new Set<number>();

globalThis.startingBroadcasts = startingChannels;

/*
================================
 POST
================================
*/

export async function POST(req: Request) {
  let channelId: number | null = null;

  try {
    const body = await req.json();

    channelId = Number(body.channelId);

    if (!channelId || Number.isNaN(channelId)) {
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
================================
 DUPLICATE PROTECTION
================================
*/

    if (startingChannels.has(channelId)) {
      return NextResponse.json(
        {
          error: "Broadcast is already starting",
        },

        {
          status: 409,
        },
      );
    }

    startingChannels.add(channelId);

    console.log("🚀 START BROADCAST", channelId);

    /*
================================
 START SCHEDULER
================================

Scheduler will:
- find current schedule
- load playlist
- start broadcast
- fallback if empty

*/

    if (!scheduler.isRunning(channelId)) {
      scheduler.start(channelId);

      console.log("⏰ Scheduler started", channelId);
    } else {
      console.log("⚠ Scheduler already running", channelId);
    }

    return NextResponse.json({
      success: true,

      channelId,

      message: "Broadcast scheduler started",
    });
  } catch (error) {
    console.error("❌ Start broadcast error", error);

    return NextResponse.json(
      {
        error: "Internal server error",
      },

      {
        status: 500,
      },
    );
  } finally {
    if (channelId) {
      startingChannels.delete(channelId);
    }
  }
}
