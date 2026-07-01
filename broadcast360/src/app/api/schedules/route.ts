import { NextRequest } from "next/server";
import { getPaginatedSchedules } from "@/repositories/schedule.repository";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const page = Number(searchParams.get("page") ?? 1);
    const limit = Number(searchParams.get("limit") ?? 5);
    const search = searchParams.get("search") ?? undefined;
    const date = searchParams.get("date") ?? undefined;

    const result = await getPaginatedSchedules({
      page,
      limit,
      search,
      date,
    });

    return Response.json({
      data: result.data,
      pagination: {
        page,
        limit,
        total: result.total,
      },
    });
  } catch (error) {
    console.error(error);
    return Response.json(
      { message: "Failed to get schedules" },
      { status: 500 }
    );
  }
}