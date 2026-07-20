import { NextRequest, NextResponse } from "next/server";
import { ScheduleService } from "@/services/schedule.service";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page") ?? "1");
  const limit = Number(searchParams.get("limit") ?? "10");
  const search = searchParams.get("search") || undefined;
  const date = searchParams.get("date") || undefined;

  // Use the clear paginated strategy if queries are active, otherwise fall back to getAll
  if (searchParams.has("page") || searchParams.has("search") || searchParams.has("date")) {
    const data = await ScheduleService.getPaginated(page, limit, search, date);
    return NextResponse.json(data);
  }

  const schedules = await ScheduleService.getAll();
  return NextResponse.json(schedules);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      channelId,
      playlistId,
      startTime,
      endTime,
    } = body;


    const start = new Date(startTime);
    const end = new Date(endTime);


    // Basic validation
    if (end <= start) {
      return NextResponse.json(
        { message: "End time must be after start time" },
        { status: 400 }
      );
    }


    // Check existing schedules
    const existingSchedules = await prisma.schedule.findMany({
      where: {
        channelId: Number(channelId),
      },
    });


    const conflict = existingSchedules.some((schedule) => {
      const existingStart = new Date(schedule.startTime);
      const existingEnd = schedule.endTime
        ? new Date(schedule.endTime)
        : existingStart;


      return (
        start < existingEnd &&
        end > existingStart
      );
    });


    if (conflict) {
      return NextResponse.json(
        {
          message:
            "Schedule conflict: another playlist is already scheduled during this time.",
        },
        { status: 409 }
      );
    }


    const schedule = await prisma.schedule.create({
      data: {
        channelId: Number(channelId),
        playlistId: Number(playlistId),
        startTime: start,
        endTime: end,
      },
    });


    return NextResponse.json(
      {
        success: true,
        data: schedule,
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("POST /api/schedules error:", error);

    return NextResponse.json(
      {
        message: "Failed to create schedule",
      },
      { status: 500 }
    );
  }
}