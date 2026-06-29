import { NextRequest, NextResponse } from "next/server";
import { fetchSeries, addSeries } from "@/services/serie.service";

/* ================= GET ================= */
export async function GET() {
  try {
    const series = await fetchSeries();
    return NextResponse.json(series, { status: 200 });
  } catch (error) {
    console.error("GET /api/series error:", error);

    return NextResponse.json(
      { message: "Failed to fetch series" },
      { status: 500 }
    );
  }
}

/* ================= POST ================= */
export async function POST(req: NextRequest) {
  try {
    // ✅ directly parse form-data (no manual header check)
    const formData = await req.formData();

    const series = await addSeries(formData);

    return NextResponse.json(series, { status: 201 });
  } catch (error) {
    console.error("POST /api/series error:", error);

    return NextResponse.json(
      { message: "Create error" },
      { status: 500 }
    );
  }
}