import { NextResponse } from "next/server";
import { SchedulerManager } from "@/managers/scheduler.manager";

const scheduler = new SchedulerManager();

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { channelId } = body;

    if (!channelId) {
      return NextResponse.json(
        { error: "channelId required" },
        { status: 400 }
      );
    }


    scheduler.start(Number(channelId));


    return NextResponse.json({
      message: "Scheduler started",
      channelId,
    });


  } catch (error) {

    console.error(error);

    return NextResponse.json(
      {
        error: "Failed to start scheduler"
      },
      {
        status: 500
      }
    );
  }
}