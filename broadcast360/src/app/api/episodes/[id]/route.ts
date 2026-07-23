import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const episodeId = Number(id);

    if (isNaN(episodeId)) {
      return Response.json({ message: "Invalid episode id" }, { status: 400 });
    }

    const episode = await prisma.episode.findUnique({
      where: { id: episodeId },
    });

    if (!episode) {
      return Response.json({ message: "Episode not found" }, { status: 404 });
    }

    await prisma.episode.delete({
      where: { id: episodeId },
    });

    return Response.json({
      success: true,
      message: "Episode deleted successfully",
    });
  } catch (error) {
    console.error("DELETE_ERROR:", error);

    return Response.json(
      { message: "Failed to delete episode" },
      { status: 500 },
    );
  }
}
