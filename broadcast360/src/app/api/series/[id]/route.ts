import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

import {
  removeSeries,
  editSeries,
} from "@/services/serie.service";

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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // ✅ FIX HERE

    const { searchParams } = new URL(request.url);

    const page = Number(searchParams.get("page") || 1);
    const limitParam = searchParams.get("limit");

    const limit = Number(limitParam || 5);
    const skip = (page - 1) * limit;

    const seriesId = Number(id); // ✅ use id from awaited params

    if (isNaN(seriesId)) {
      return Response.json(
        { message: "Invalid series id" },
        { status: 400 }
      );
    }

    const series = await prisma.series.findUnique({
      where: { id: seriesId },
      include: {
        episodes: {
          orderBy: { episodeNo: "asc" },
          ...(limitParam ? { skip, take: limit } : {}),
        },
      },
    });

    if (!series) {
      return Response.json(
        { message: "Series not found" },
        { status: 404 }
      );
    }

    const total = await prisma.episode.count({
      where: { seriesId },
    });

    return Response.json({
      data: series,
      total,
      totalPages: Math.ceil(total / limit),
      page,
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      { message: "Failed to get series" },
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
