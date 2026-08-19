import { NextResponse } from "next/server";
import { PlaylistService } from "@/services/playlist.service";

type RouteContext = {
  params: Promise<{ playlistId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { playlistId: playlistIdParam } = await context.params;
    const playlistId = Number(playlistIdParam);

    if (!Number.isInteger(playlistId) || playlistId <= 0) {
      return NextResponse.json(
        { message: "Invalid playlistId." },
        { status: 400 },
      );
    }

    const playlist = await PlaylistService.getPlaylistById(playlistId);

    if (!playlist) {
      return NextResponse.json(
        { message: "Playlist not found." },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: playlist });
  } catch (error) {
    console.error("GET PLAYLIST ERROR", error);
    return NextResponse.json(
      { success: false, message: "Failed to load playlist." },
      { status: 500 },
    );
  }
}
