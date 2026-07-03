import { NextRequest, NextResponse } from "next/server";
import { PlaylistService } from "@/services/playlist.service";

// GET PLAYLIST
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ programId: string; playlistId: string }> }
) {
  const { programId, playlistId } = await params;

  const programIdNum = Number(programId);
  const playlistIdNum = Number(playlistId);

  if (isNaN(programIdNum) || isNaN(playlistIdNum)) {
    return NextResponse.json(
      { message: "Invalid ids" },
      { status: 400 }
    );
  }

  const playlist = await PlaylistService.getPlaylistById(
    playlistIdNum
  );

  if (!playlist) {
    return NextResponse.json(
      { message: "Playlist not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ data: playlist });
}

// UPDATE PLAYLIST
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ playlistId: string }> }
) {
  try {
    const { playlistId } = await params;

    const id = Number(playlistId);

    if (isNaN(id)) {
      return NextResponse.json(
        { message: "Invalid playlist id" },
        { status: 400 }
      );
    }

    const body = await req.json();

    const playlist = await PlaylistService.updatePlaylist(id, {
      name: body.name,
    });

    return NextResponse.json({
      data: playlist,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Failed to update playlist" },
      { status: 500 }
    );
  }
}

// DELETE PLAYLIST
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ playlistId: string }> }
) {
  try {
    const { playlistId } = await params;

    const id = Number(playlistId);

    if (isNaN(id)) {
      return NextResponse.json(
        { message: "Invalid playlist id" },
        { status: 400 }
      );
    }

    await PlaylistService.deletePlaylist(id);

    return NextResponse.json({
      message: "Playlist deleted successfully",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Failed to delete playlist" },
      { status: 500 }
    );
  }
}