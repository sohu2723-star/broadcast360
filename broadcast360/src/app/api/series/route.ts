import { NextRequest, NextResponse } from "next/server";
import {
  fetchPaginatedSeries,
  addSeries,
} from "@/services/serie.service";

/* ================= GET ================= */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const page = Math.max(
      1,
      parseInt(searchParams.get("page") ?? "1", 10) || 1
    );

    const limit = Math.max(
      1,
      parseInt(searchParams.get("limit") ?? "10", 10) || 10
    );

    const search = searchParams.get("search") ?? undefined;

    const result = await fetchPaginatedSeries(page, limit, search);

    return NextResponse.json(result);
  } catch (error) {
  console.error("POST /api/series error:", error);

  if (
    error instanceof Error &&
    error.message === "Series name already exists"
  ) {
    return NextResponse.json(
      { message: "Series name already exists" },
      { status: 400 }
    );
  }

  return NextResponse.json(
    {
      message: error instanceof Error ? error.message : "Create error",
    },
    { status: 500 }
  );
}
}

/* ================= POST ================= */
/* ================= POST ================= */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const releaseYearRaw = formData.get("releaseYear");
    const releaseYear = Number(releaseYearRaw);

    const currentYear = new Date().getFullYear();

    if (
      releaseYearRaw === null ||
      releaseYearRaw === "" ||
      Number.isNaN(releaseYear) ||
      !Number.isInteger(releaseYear) ||
      releaseYear < 1900 ||
      releaseYear > currentYear
    ) {
      return NextResponse.json(
        { message: "Invalid release year" },
        { status: 400 }
      );
    }

    const series = await addSeries(formData);

    return NextResponse.json(series, { status: 201 });
  } catch (error) {
    console.error("POST /api/series error:", error);

    // DUPLICATE SERIES NAME
    if (
      error instanceof Error &&
      error.message === "Series name already exists"
    ) {
      return NextResponse.json(
        { message: "Series name already exists" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Create error" },
      { status: 500 }
    );
  }
}
