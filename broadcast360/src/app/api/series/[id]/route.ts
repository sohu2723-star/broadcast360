import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

import {
  removeSeries,
  editSeries,
} from "@/services/serie.service";

/* =====================================================
   PUT - EDIT SERIES
===================================================== */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const numericId = Number(id);

    if (!Number.isInteger(numericId) || numericId <= 0) {
      return NextResponse.json(
        { message: "Invalid series id" },
        { status: 400 },
      );
    }

    const formData = await req.formData();

    const titleRaw = formData.get("title");
    const descriptionRaw = formData.get("description");
    const genreRaw = formData.get("genre");
    const releaseYearRaw = formData.get("releaseYear");

    const title = String(titleRaw ?? "").trim();
    const description = String(descriptionRaw ?? "").trim();
    const genre = String(genreRaw ?? "").trim();
    const releaseYear = Number(releaseYearRaw);

    const thumbnailValue = formData.get("thumbnail");

    const thumbnail =
      thumbnailValue instanceof File && thumbnailValue.size > 0
        ? thumbnailValue
        : null;

    /* =====================================================
       VALIDATE TITLE
    ===================================================== */

    if (!title) {
      return NextResponse.json(
        { message: "Series name is required" },
        { status: 400 },
      );
    }

    /* =====================================================
       VALIDATE RELEASE YEAR
    ===================================================== */

    const currentYear = new Date().getFullYear();

    if (
      !Number.isInteger(releaseYear) ||
      releaseYear < 1900 ||
      releaseYear > currentYear
    ) {
      return NextResponse.json(
        { message: "Invalid release year" },
        { status: 400 },
      );
    }

    /* =====================================================
       CHECK DUPLICATE SERIES NAME
       
       IMPORTANT:
       Same series ကို exclude လုပ်တယ်.
       
       Example:
       Series 1 = Naruto
       Series 2 = One Piece

       Series 2 ကို Naruto ပြောင်းမယ်ဆိုရင် ❌
       
       Series 1 ကို Naruto အတိုင်းထားပြီး edit လုပ်ရင် ✅
    ===================================================== */

    const existingSeries = await prisma.series.findFirst({
      where: {
        title: {
          equals: title,
          mode: "insensitive",
        },
        NOT: {
          id: numericId,
        },
      },
      select: {
        id: true,
        title: true,
      },
    });

    if (existingSeries) {
      return NextResponse.json(
        {
          message: "Series name already exists",
        },
        { status: 400 },
      );
    }

    /* =====================================================
       UPDATE
    ===================================================== */

    const series = await editSeries(numericId, {
      title,
      description,
      genre,
      releaseYear,
      thumbnail,
    });

    return NextResponse.json(series);
  } catch (error) {
    console.error("PUT /api/series/[id] error:", error);

    /* =====================================================
       DUPLICATE ERROR
    ===================================================== */

    if (
      error instanceof Error &&
      error.message === "Series name already exists"
    ) {
      return NextResponse.json(
        {
          message: "Series name already exists",
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        message: "Update failed",
      },
      { status: 500 },
    );
  }
}

/* =====================================================
   GET - SERIES DETAIL + EPISODES
===================================================== */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const seriesId = Number(id);

    if (!Number.isInteger(seriesId) || seriesId <= 0) {
      return Response.json(
        { message: "Invalid series id" },
        { status: 400 },
      );
    }

    const { searchParams } = new URL(request.url);

    const page = Math.max(
      1,
      Number(searchParams.get("page") || 1),
    );

    const limitParam = searchParams.get("limit");

    const limit = Math.max(
      1,
      Number(limitParam || 5),
    );

    const skip = (page - 1) * limit;

    /* =====================================================
       FIND SERIES
    ===================================================== */

    const series = await prisma.series.findUnique({
      where: {
        id: seriesId,
      },

      include: {
        episodes: {
          orderBy: {
            episodeNo: "asc",
          },

          ...(limitParam
            ? {
                skip,
                take: limit,
              }
            : {}),
        },
      },
    });

    if (!series) {
      return Response.json(
        {
          message: "Series not found",
        },
        { status: 404 },
      );
    }

    /* =====================================================
       TOTAL PARTS
    ===================================================== */

    const totalParts = await prisma.episode.count({
      where: {
        seriesId,
      },
    });

    /* =====================================================
       UNIQUE EPISODE COUNT
    ===================================================== */

    const uniqueEpisodesGroup =
      await prisma.episode.groupBy({
        by: ["episodeNo"],

        where: {
          seriesId,
        },
      });

    const uniqueEpisodeCount =
      uniqueEpisodesGroup.length;

    /* =====================================================
       FORMAT RESPONSE
    ===================================================== */

    const formattedData = {
      ...series,

      episodeCount: uniqueEpisodeCount,

      partCount: totalParts,
    };

    return Response.json({
      data: formattedData,

      total: totalParts,

      totalPages: Math.ceil(
        totalParts / limit,
      ),

      page,
    });
  } catch (error) {
    console.error(
      "GET /api/series/[id] error:",
      error,
    );

    return Response.json(
      {
        message: "Failed to get series",
      },
      { status: 500 },
    );
  }
}

/* =====================================================
   DELETE
===================================================== */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const numericId = Number(id);

    if (
      !Number.isInteger(numericId) ||
      numericId <= 0
    ) {
      return NextResponse.json(
        {
          message: "Invalid series id",
        },
        { status: 400 },
      );
    }

    await removeSeries(numericId);

    return NextResponse.json({
      message: "deleted",
    });
  } catch (error) {
    console.error(
      "DELETE /api/series/[id] error:",
      error,
    );

    return NextResponse.json(
      {
        message: "Delete failed",
      },
      { status: 500 },
    );
  }
}