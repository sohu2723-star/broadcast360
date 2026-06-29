import { NextRequest, NextResponse } from "next/server";

import {
  fetchSeriesById,
  removeSeries,
  editSeries,
} from "@/services/serie.service";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const series = await fetchSeriesById(Number(id));

    return NextResponse.json(series);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Failed to fetch series" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const numericId = Number(id);

    const formData = await req.formData();

    const title = String(formData.get("title"));
    const description = String(formData.get("description"));
    const genre = String(formData.get("genre"));
    const releaseYear = Number(formData.get("releaseYear"));
    const thumbnail = formData.get("thumbnail") as File | null;

    const series = await editSeries(numericId, {
      title,
      description,
      genre,
      releaseYear,
      thumbnail,
    });

    return NextResponse.json(series);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Update failed" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await removeSeries(Number(id));

    return NextResponse.json({ message: "deleted" });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Delete failed" },
      { status: 500 }
    );
  }
}