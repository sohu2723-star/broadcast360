import { NextRequest, NextResponse } from "next/server";
import { PlaylistService } from "@/services/playlist.service";

export async function GET(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ programId: string }>;
  },
) {
  try {
    const { programId } = await params;

    const id = Number(programId);

    if (isNaN(id)) {
      return NextResponse.json(
        { message: "Invalid programId" },
        { status: 400 },
      );
    }

    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page") ?? 1);
    const limit = 3;

    const data = await PlaylistService.getProgramPlaylists(id, page, limit);
    //console.log("PLAYLIST API DATA:", data);
    return NextResponse.json({ data });
  } catch (error) {
    // console.error("GET PLAYLIST ERROR:", error);

    return NextResponse.json(
      {
        message: "Failed to load playlists",
        error: String(error),
      },
      { status: 500 },
    );
  }
}

export async function POST(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ programId: string }>;
  },
) {
  try {
    const { programId } = await params;
    const id = Number(programId);

    if (isNaN(id)) {
      return NextResponse.json(
        { message: "Invalid programId" },
        { status: 400 },
      );
    }

    const body = await req.json();

    if (!body.name) {
      return NextResponse.json(
        { message: "Playlist name is required" },
        { status: 400 },
      );
    }

    const playlist = await PlaylistService.createPlaylist(id, {
      name: body.name,
    });

    return NextResponse.json({ data: playlist }, { status: 201 });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Failed to create playlist" },
      { status: 500 },
    );
  }
}
