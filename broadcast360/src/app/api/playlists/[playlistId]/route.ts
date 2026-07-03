import { NextRequest, NextResponse } from "next/server";
import { PlaylistService } from "@/services/playlist.service";

export async function  GET(
  req: NextRequest,
  { params }: { params: { programId: string; playlistId: string } }
) {
  try {
    const programId = Number(params.programId);
    const playlistId = Number(params.playlistId);

    if (isNaN(programId) || isNaN(playlistId)) {
      return NextResponse.json(
        { message: "Invalid ids" },
        { status: 400 }
      );
    }

    const playlist =
      await PlaylistService.getPlaylistById(
        playlistId
      );

    if (!playlist) {
      return NextResponse.json(
        { message: "Playlist not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: playlist,
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to load playlist" },
      { status: 500 }
    );
  }
}