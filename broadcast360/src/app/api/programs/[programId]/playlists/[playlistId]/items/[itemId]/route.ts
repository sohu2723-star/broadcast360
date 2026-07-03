import { NextRequest, NextResponse } from "next/server";
import { PlaylistItemService } from "@/services/playlist-item.service";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const { itemId } = await params;

    const id = Number(itemId);

    if (isNaN(id)) {
      return NextResponse.json(
        { message: "Invalid item id" },
        { status: 400 }
      );
    }

    await PlaylistItemService.delete(id);

    return NextResponse.json({
      message: "Playlist item deleted",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: "Failed to delete playlist item",
      },
      {
        status: 500,
      }
    );
  }
}