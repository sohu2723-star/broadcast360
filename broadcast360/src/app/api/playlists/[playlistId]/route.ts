import { NextRequest, NextResponse } from "next/server";

import { PlaylistService } from "@/services/playlist.service";

export async function GET(
  req: NextRequest,
  {
    params,
  }: {
    params: {
      programId: string;
      playlistId: string;
    };
  },
) {
  try {
    const programId = Number(params.programId);
    const playlistId = Number(params.playlistId);

    if (
      Number.isNaN(programId) ||
      Number.isNaN(playlistId)
    ) {
      return NextResponse.json(
        {
          message: "Invalid programId or playlistId.",
        },
        {
          status: 400,
        },
      );
    }

    const playlist =
      await PlaylistService.getPlaylistById(
        playlistId,
      );

    if (!playlist) {
      return NextResponse.json(
        {
          message: "Playlist not found.",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: playlist,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(
      "GET Playlist Error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load playlist.",
      },
      {
        status: 500,
      },
    );
  }
}