import { NextRequest, NextResponse } from "next/server";

import {
  fetchEpisodesBySeriesId,
  addEpisode,
} from "@/services/episode.service";

// ========================
// GET ALL EPISODES
// ========================
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const seriesId = Number(id);

    if (isNaN(seriesId)) {
      return NextResponse.json(
        { message: "Invalid seriesId" },
        { status: 400 }
      );
    }

    const episodes = await fetchEpisodesBySeriesId(seriesId);

    return NextResponse.json(episodes);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Failed to fetch episodes" },
      { status: 500 }
    );
  }
}

// ========================
// CREATE EPISODE
// ========================
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const seriesId = Number(id);

    if (isNaN(seriesId)) {
      return NextResponse.json(
        { message: "Invalid seriesId" },
        { status: 400 }
      );
    }

    const formData = await req.formData();

    const title = formData.get("title")?.toString();
    const episodeNo = Number(formData.get("episodeNo"));

    if (!title || isNaN(episodeNo)) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const episode = await addEpisode(seriesId, {
      title,
      episodeNo,
      formData,
    });

    return NextResponse.json({
      message: "Episode created successfully",
      data: episode,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Create error";

    console.error(error);

    return NextResponse.json(
      { message },
      { status: 400 }
    );
  }
}