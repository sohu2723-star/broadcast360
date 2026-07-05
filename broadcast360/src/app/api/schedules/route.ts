import { NextRequest, NextResponse } from "next/server";
import { ScheduleService } from "@/services/schedule.service";

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
    const schedule = await ScheduleService.create(body);
    return NextResponse.json(schedule, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Create failed" },
      { status: 400 }
    );
  }
}