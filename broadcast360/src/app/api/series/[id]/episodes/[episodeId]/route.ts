import { NextRequest, NextResponse } from "next/server";

import { getEpisodeById, updateEpisode } from "@/services/episode.service";

// ========================
// GET EPISODE
// ========================
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ episodeId: string }> },
) {
  try {
    const { episodeId } = await params;

    const id = Number(episodeId);

    if (isNaN(id)) {
      return NextResponse.json(
        { message: "Invalid episodeId" },
        { status: 400 },
      );
    }

    const episode = await getEpisodeById(id);

    if (!episode) {
      return NextResponse.json(
        { message: "Episode not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(episode);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Failed to fetch episode" },
      { status: 500 },
    );
  }
}

// ========================
// UPDATE EPISODE
// ========================
// ========================
// UPDATE EPISODE
// ========================
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ episodeId: string }> },
) {
  try {
    const { episodeId } = await params;

    const id = Number(episodeId);

    if (isNaN(id)) {
      return NextResponse.json(
        { message: "Invalid episodeId" },
        { status: 400 },
      );
    }

    const formData = await req.formData();

    const title = formData.get("title")?.toString()?.trim();
    const episodeNoRaw = formData.get("episodeNo");
    const episodeNo = episodeNoRaw !== null ? Number(episodeNoRaw) : NaN;

    const videoFileRaw = formData.get("video");
    const thumbnailFileRaw = formData.get("thumbnail");

    const videoFile = videoFileRaw instanceof File ? videoFileRaw : null;

    const thumbnailFile =
      thumbnailFileRaw instanceof File ? thumbnailFileRaw : null;

    if (!title || isNaN(episodeNo)) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 },
      );
    }

    // ⭐ Define a strict type for the update payload instead of using 'any'
    interface UpdateEpisodePayload {
      title: string;
      episodeNo: number;
      videoFile?: File; // Change this to 'videoUrl?: string' if your service layer expects a string path instead
      thumbnailFile?: File;
    }

    const updatePayload: UpdateEpisodePayload = {
      title,
      episodeNo,
    };

    if (videoFile && videoFile.size > 0 && videoFile.name !== "undefined") {
      updatePayload.videoFile = videoFile;
    }
    if (
      thumbnailFile &&
      thumbnailFile.size > 0 &&
      thumbnailFile.name !== "undefined"
    ) {
      updatePayload.thumbnailFile = thumbnailFile;
    }

    const episode = await updateEpisode(id, updatePayload);

    return NextResponse.json({
      message: "Episode updated successfully",
      data: episode,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Update failed";

    console.error(error);

    return NextResponse.json({ message }, { status: 400 });
  }
}
