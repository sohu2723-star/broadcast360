import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ playlistId: string; id: string }>;
};

function parseId(value: string) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function GET(_request: Request, context: RouteContext) {
  const { playlistId: playlistIdParam, id: itemIdParam } = await context.params;
  const playlistId = parseId(playlistIdParam);
  const itemId = parseId(itemIdParam);

  if (!playlistId || !itemId) {
    return NextResponse.json({ message: "Invalid playlist item id" }, { status: 400 });
  }

  try {
    const item = await prisma.playlistItem.findFirst({
      where: { id: itemId, playlistId },
      include: {
        movie: true,
        episode: true,
        advertisement: true,
        news: true,
        stream: true,
        entertainment: true,
      },
    });

    if (!item) {
      return NextResponse.json({ message: "Playlist item not found" }, { status: 404 });
    }

    return NextResponse.json({ data: item });
  } catch (error) {
    console.error("GET PLAYLIST ITEM ERROR", error);
    return NextResponse.json({ message: "Failed to load playlist item" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { playlistId: playlistIdParam, id: itemIdParam } = await context.params;
  const playlistId = parseId(playlistIdParam);
  const itemId = parseId(itemIdParam);

  if (!playlistId || !itemId) {
    return NextResponse.json({ message: "Invalid playlist item id" }, { status: 400 });
  }

  try {
    const item = await prisma.playlistItem.findFirst({
      where: { id: itemId, playlistId },
      select: { id: true },
    });

    if (!item) {
      return NextResponse.json({ message: "Playlist item not found" }, { status: 404 });
    }

    await prisma.playlistItem.delete({ where: { id: itemId } });
    return NextResponse.json({ message: "Playlist item deleted" });
  } catch (error) {
    console.error("DELETE PLAYLIST ITEM ERROR", error);
    return NextResponse.json({ message: "Failed to delete playlist item" }, { status: 500 });
  }
}
