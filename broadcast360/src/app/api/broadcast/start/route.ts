import { NextResponse } from "next/server";
import { ScheduleRepository } from "@/repositories/schedule.repository";
import { BroadcastService } from "@/services/broadcast.service";
import { ScheduleWithRelations } from "@/types/schedule.types";

const broadcast = new BroadcastService();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { scheduleId } = body;

    if (!scheduleId) {
      return NextResponse.json(
        { error: "scheduleId required" },
        { status: 400 }
      );
    }

    // 1. load schedule with playlist + items
    const schedule = await ScheduleRepository.findById(scheduleId);

    if (!schedule) {
      return NextResponse.json(
        { error: "Schedule not found" },
        { status: 404 }
      );
    }

    // 2. start broadcast manually
    if (!schedule) {
  return Response.json(
    { error: "No schedule found" },
    { status: 404 }
  );
}

await broadcast.start(
  schedule,
  schedule.channelId
);

    return NextResponse.json({
      message: "Broadcast started",
      scheduleId,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err || "Internal error" },
      { status: 500 }
    );
  }
}