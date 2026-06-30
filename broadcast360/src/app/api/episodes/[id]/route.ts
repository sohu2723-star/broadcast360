import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);

    await prisma.episode.delete({
      where: { id },
    });

    return Response.json({ message: "Deleted successfully" });
  } catch (error) {
    return Response.json(
      { message: "Delete failed" },
      { status: 500 }
    );
  }
}