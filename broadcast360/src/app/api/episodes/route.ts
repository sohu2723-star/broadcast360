import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET episodes by seriesId
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const seriesId = Number(searchParams.get("seriesId"));

    if (!seriesId) {
      return NextResponse.json(
        {
          success: false,
          message: "seriesId required",
        },
        {
          status: 400,
        },
      );
    }

    const episodes = await prisma.episode.findMany({
      where: {
        seriesId,
      },

      orderBy: [{ createdAt: "desc" }, { title: "asc" }],

      select: {
        id: true,
        title: true,
        episodeNo: true,
        duration: true,
        videoUrl: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,

      data: episodes,
    });
  } catch (error) {
    console.error("GET episodes error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch episodes",
      },

      {
        status: 500,
      },
    );
  }
}
