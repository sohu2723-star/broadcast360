import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  fetchEpisodesBySeriesId,
  addEpisode,
} from "@/services/episode.service";

// =====================================================
// GET
// =====================================================

export async function GET(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  },
) {
  try {
    const { id } =
      await params;

    const seriesId =
      Number(id);

    if (
      !Number.isInteger(seriesId) ||
      seriesId < 1
    ) {
      return NextResponse.json(
        {
          message:
            "Invalid seriesId",
        },
        {
          status: 400,
        },
      );
    }

    const episodes =
      await fetchEpisodesBySeriesId(
        seriesId,
      );

    return NextResponse.json(
      episodes,
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(
      "GET EPISODES ERROR:",
      error,
    );

    return NextResponse.json(
      {
        message:
          "Failed to fetch episodes",
      },
      {
        status: 500,
      },
    );
  }
}

// =====================================================
// POST
// =====================================================

export async function POST(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  },
) {
  try {
    const { id } =
      await params;

    const seriesId =
      Number(id);

    // =================================================
    // SERIES ID
    // =================================================

    if (
      !Number.isInteger(seriesId) ||
      seriesId < 1
    ) {
      return NextResponse.json(
        {
          message:
            "Invalid seriesId",
        },
        {
          status: 400,
        },
      );
    }

    // =================================================
    // FORM DATA
    // =================================================

    const formData =
      await req.formData();

    // =================================================
    // TITLE
    // =================================================

    const titleRaw =
      formData.get("title");

    const title =
      typeof titleRaw === "string"
        ? titleRaw.trim()
        : "";

    // =================================================
    // EPISODE NUMBER
    // =================================================

    const episodeNo =
      Number(
        formData.get(
          "episodeNo",
        ),
      );

    // =================================================
    // VIDEO
    // =================================================

    const videoRaw =
      formData.get("video");

    const videoFile =
      videoRaw instanceof File &&
      videoRaw.size > 0
        ? videoRaw
        : null;

    // =================================================
    // THUMBNAIL
    // =================================================

    const thumbnailRaw =
      formData.get("thumbnail");

    const thumbnailFile =
      thumbnailRaw instanceof File &&
      thumbnailRaw.size > 0
        ? thumbnailRaw
        : null;

    // =================================================
    // VALIDATE EPISODE NUMBER
    // =================================================

    if (
      !Number.isInteger(
        episodeNo,
      ) ||
      episodeNo < 1
    ) {
      return NextResponse.json(
        {
          message:
            "Invalid episode number",
        },
        {
          status: 400,
        },
      );
    }

    // =================================================
    // VIDEO REQUIRED
    // =================================================

    if (!videoFile) {
      return NextResponse.json(
        {
          message:
            "Video file is required",
        },
        {
          status: 400,
        },
      );
    }

    // =================================================
    // CREATE
    //
    // IMPORTANT:
    // title can be empty.
    // service will auto-generate it.
    // =================================================

    const episode =
      await addEpisode(
        seriesId,
        {
          title,
          episodeNo,
          videoFile,
          thumbnailFile,
        },
      );

    // =================================================
    // RESPONSE
    // =================================================

    return NextResponse.json(
      {
        message:
          "Episode created successfully",
        data: episode,
      },
      {
        status: 201,
      },
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Create error";

    console.error(
      "CREATE EPISODE ERROR:",
      error,
    );

    // =================================================
    // DUPLICATE TITLE
    // =================================================

    if (
      message ===
      "Episode title already exists"
    ) {
      return NextResponse.json(
        {
          message:
            "This episode title already exists.",
        },
        {
          status: 409,
        },
      );
    }

    // =================================================
    // SERIES NOT FOUND
    // =================================================

    if (
      message ===
      "Series not found"
    ) {
      return NextResponse.json(
        {
          message:
            "Series not found",
        },
        {
          status: 404,
        },
      );
    }

    // =================================================
    // VIDEO
    // =================================================

    if (
      message ===
      "Video file is required"
    ) {
      return NextResponse.json(
        {
          message:
            "Video file is required",
        },
        {
          status: 400,
        },
      );
    }

    // =================================================
    // EPISODE NUMBER
    // =================================================

    if (
      message ===
      "Invalid episode number"
    ) {
      return NextResponse.json(
        {
          message:
            "Invalid episode number",
        },
        {
          status: 400,
        },
      );
    }

    // =================================================
    // OTHER ERROR
    // =================================================

    return NextResponse.json(
      {
        message,
      },
      {
        status: 500,
      },
    );
  }
}