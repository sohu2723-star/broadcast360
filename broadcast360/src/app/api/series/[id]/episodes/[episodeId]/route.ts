import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  getEpisodeById,
  updateEpisode,
  deleteEpisode,
} from "@/services/episode.service";

// =====================================================
// GET EPISODE
// =====================================================

export async function GET(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      id: string;
      episodeId: string;
    }>;
  },
) {
  try {
    const {
      id,
      episodeId,
    } = await params;

    const seriesId =
      Number(id);

    const parsedEpisodeId =
      Number(episodeId);

    if (
      !Number.isInteger(seriesId) ||
      seriesId < 1
    ) {
      return NextResponse.json(
        {
          message: "Invalid seriesId",
        },
        {
          status: 400,
        },
      );
    }

    if (
      !Number.isInteger(
        parsedEpisodeId,
      ) ||
      parsedEpisodeId < 1
    ) {
      return NextResponse.json(
        {
          message:
            "Invalid episodeId",
        },
        {
          status: 400,
        },
      );
    }

    const episode =
      await getEpisodeById(
        parsedEpisodeId,
      );

    if (!episode) {
      return NextResponse.json(
        {
          message:
            "Episode not found",
        },
        {
          status: 404,
        },
      );
    }

    // Make sure the episode belongs
    // to this series.
    if (
      Number(episode.seriesId) !==
      seriesId
    ) {
      return NextResponse.json(
        {
          message:
            "Episode not found",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json(
      episode,
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(
      "GET EPISODE ERROR:",
      error,
    );

    return NextResponse.json(
      {
        message:
          "Failed to fetch episode",
      },
      {
        status: 500,
      },
    );
  }
}

// =====================================================
// UPDATE EPISODE
// =====================================================

export async function PUT(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      id: string;
      episodeId: string;
    }>;
  },
) {
  try {
    const {
      id,
      episodeId,
    } = await params;

    const seriesId =
      Number(id);

    const parsedEpisodeId =
      Number(episodeId);

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

    if (
      !Number.isInteger(
        parsedEpisodeId,
      ) ||
      parsedEpisodeId < 1
    ) {
      return NextResponse.json(
        {
          message:
            "Invalid episodeId",
        },
        {
          status: 400,
        },
      );
    }

    // -------------------------------------------------
    // Check episode
    // -------------------------------------------------

    const currentEpisode =
      await getEpisodeById(
        parsedEpisodeId,
      );

    if (!currentEpisode) {
      return NextResponse.json(
        {
          message:
            "Episode not found",
        },
        {
          status: 404,
        },
      );
    }

    // -------------------------------------------------
    // Check series
    // -------------------------------------------------

    if (
      Number(
        currentEpisode.seriesId,
      ) !== seriesId
    ) {
      return NextResponse.json(
        {
          message:
            "Episode not found",
        },
        {
          status: 404,
        },
      );
    }

    // -------------------------------------------------
    // FormData
    // -------------------------------------------------

    const formData =
      await req.formData();

    const titleRaw =
      formData.get("title");

    const episodeNoRaw =
      formData.get(
        "episodeNo",
      );

    const videoRaw =
      formData.get("video");

    const thumbnailRaw =
      formData.get(
        "thumbnail",
      );

    const title =
      typeof titleRaw ===
      "string"
        ? titleRaw.trim()
        : undefined;

    const episodeNo =
      Number(episodeNoRaw);

    const videoFile =
      videoRaw instanceof File &&
      videoRaw.size > 0
        ? videoRaw
        : null;

    const thumbnailFile =
      thumbnailRaw instanceof File &&
      thumbnailRaw.size > 0
        ? thumbnailRaw
        : null;

    // -------------------------------------------------
    // Validation
    // -------------------------------------------------

    if (
      !title
    ) {
      return NextResponse.json(
        {
          message:
            "Episode title is required",
        },
        {
          status: 400,
        },
      );
    }

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

    // -------------------------------------------------
    // Update
    // -------------------------------------------------

    const episode =
      await updateEpisode(
        parsedEpisodeId,
        {
          title,
          episodeNo,
          videoFile,
          thumbnailFile,
        },
      );

    return NextResponse.json(
      {
        message:
          "Episode updated successfully",
        data: episode,
      },
      {
        status: 200,
      },
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Update failed";

    console.error(
      "UPDATE EPISODE ERROR:",
      error,
    );

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
          status: 400,
        },
      );
    }

    if (
      message ===
      "Episode not found"
    ) {
      return NextResponse.json(
        {
          message:
            "Episode not found",
        },
        {
          status: 404,
        },
      );
    }

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

    return NextResponse.json(
      {
        message,
      },
      {
        status: 400,
      },
    );
  }
}

// =====================================================
// DELETE EPISODE
// =====================================================

export async function DELETE(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      id: string;
      episodeId: string;
    }>;
  },
) {
  try {
    const {
      id,
      episodeId,
    } = await params;

    const seriesId =
      Number(id);

    const parsedEpisodeId =
      Number(episodeId);

    if (
      !Number.isInteger(seriesId) ||
      seriesId < 1 ||
      !Number.isInteger(
        parsedEpisodeId,
      ) ||
      parsedEpisodeId < 1
    ) {
      return NextResponse.json(
        {
          message:
            "Invalid ID",
        },
        {
          status: 400,
        },
      );
    }

    const episode =
      await getEpisodeById(
        parsedEpisodeId,
      );

    if (
      !episode ||
      Number(episode.seriesId) !==
        seriesId
    ) {
      return NextResponse.json(
        {
          message:
            "Episode not found",
        },
        {
          status: 404,
        },
      );
    }

    await deleteEpisode(
      parsedEpisodeId,
    );

    return NextResponse.json(
      {
        message:
          "Episode deleted successfully",
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(
      "DELETE EPISODE ERROR:",
      error,
    );

    return NextResponse.json(
      {
        message:
          "Failed to delete episode",
      },
      {
        status: 500,
      },
    );
  }
}