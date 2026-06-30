import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.episode.delete({
      where: {
        id: Number(id),
      },
    });

    return Response.json({
      success: true,
      message: "Episode deleted",
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        success: false,
        message: "Delete failed",
      },
      { status: 500 }
    );
  }
}