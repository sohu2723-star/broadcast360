import { NextRequest, NextResponse } from "next/server";
import { ScheduleService } from "@/services/schedule.service";
import { prisma } from "@/lib/prisma";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const schedule = await ScheduleService.getById(Number(id));
  if (!schedule) return NextResponse.json({ message: "Not found" }, { status: 404 });
  return NextResponse.json(schedule);
}

export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const scheduleId = Number(id);

    if (isNaN(scheduleId)) {
      return NextResponse.json({ message: "Invalid schedule target ID" }, { status: 400 });
    }

    const body = await req.json();
    const { channelId, playlistId, startTime, endTime } = body;

    // Execute the database alteration record
    const updatedSchedule = await prisma.schedule.update({
      where: { id: scheduleId },
      data: {
        channelId: Number(channelId),
        playlistId: Number(playlistId),
        startTime: new Date(startTime),
        endTime: new Date(endTime),
      },
    });

    return NextResponse.json({ success: true, data: updatedSchedule });
  } catch (error) {
    console.error("[SCHEDULE PUT API ERROR]:", error);
    return NextResponse.json({ message: "Failed to update broadcast schedule window" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    await ScheduleService.delete(Number(id));
    return NextResponse.json({ message: "Deleted" });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Delete failed" },
      { status: 500 }
    );
  }
}