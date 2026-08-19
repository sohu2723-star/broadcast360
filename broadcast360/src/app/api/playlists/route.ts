import { NextResponse } from "next/server";
import { PlaylistService } from "@/services/playlist.service";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const programId = Number(body?.programId);

    if (!Number.isInteger(programId) || programId <= 0) {
      return NextResponse.json(
        { message: "A valid programId is required" },
        { status: 400 },
      );
    }

    const { programId: _programId, ...playlistData } = body;
    const playlist = await PlaylistService.createPlaylist(programId, playlistData);

    return NextResponse.json(
      { message: "Playlist created successfully", data: playlist },
      { status: 201 },
    );
  } catch (error) {
    console.error("CREATE PLAYLIST ERROR", error);
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Something went wrong",
      },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const programId = Number(searchParams.get("programId"));

    if (!Number.isInteger(programId) || programId <= 0) {
      return NextResponse.json(
        { message: "A valid programId query parameter is required" },
        { status: 400 },
      );
    }

    const playlists = await prisma.playlist.findMany({
      where: { programId },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ data: playlists });
  } catch (error) {
    console.error("GET PLAYLISTS ERROR", error);
    return NextResponse.json({ message: "Error loading playlists" }, { status: 500 });
  }
}
