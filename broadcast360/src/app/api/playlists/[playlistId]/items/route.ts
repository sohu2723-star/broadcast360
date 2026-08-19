import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PlaylistItemService } from "@/services/playlist-item.service";

type RouteContext = {
  params: Promise<{ playlistId: string }>;
};

function parseId(value: string) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function GET(_request: Request, context: RouteContext) {
  const { playlistId: playlistIdParam } = await context.params;
  const playlistId = parseId(playlistIdParam);

  if (!playlistId) {
    return NextResponse.json({ message: "Invalid playlist id" }, { status: 400 });
  }

  try {
    const items = await prisma.playlistItem.findMany({
      where: { playlistId },
      orderBy: { order: "asc" },
      include: {
        movie: true,
        episode: true,
        advertisement: true,
        news: true,
        stream: true,
        entertainment: true,
      },
    });

    return NextResponse.json({ data: items });
  } catch (error) {
    console.error("GET PLAYLIST ITEMS ERROR", error);
    return NextResponse.json({ message: "Failed to load playlist items" }, { status: 500 });
  }
}

export async function POST(request: Request, context: RouteContext) {
  const { playlistId: playlistIdParam } = await context.params;
  const playlistId = parseId(playlistIdParam);

  if (!playlistId) {
    return NextResponse.json({ message: "Invalid playlist id" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const item = await PlaylistItemService.create(playlistId, body);

    return NextResponse.json(
      { message: "Playlist item created successfully", data: item },
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
