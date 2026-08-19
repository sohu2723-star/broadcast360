import { NextResponse } from "next/server";
import { PlaylistItemService } from "@/services/playlist-item.service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const playlistId = Number(body?.playlistId);

    if (!Number.isInteger(playlistId) || playlistId <= 0) {
      return NextResponse.json(
        { message: "A valid playlistId is required" },
        { status: 400 },
      );
    }

    const { playlistId: _playlistId, ...itemData } = body;
    const item = await PlaylistItemService.create(playlistId, itemData);

    return NextResponse.json(
      {
        message: "Playlist item created successfully",
        data: item,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("CREATE PLAYLIST ITEM ERROR", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Failed to create playlist item",
      },
      { status: 500 },
    );
  }
}
