import { prisma } from "@/lib/prisma";
import { removeSeries } from "@/services/series.service";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // ✅ FIX HERE

    const { searchParams } = new URL(request.url);

    const page = Number(searchParams.get("page") || 1);
    const limitParam = searchParams.get("limit");

    const limit = Number(limitParam || 5);
    const skip = (page - 1) * limit;

    const seriesId = Number(id); // ✅ use id from awaited params

    if (isNaN(seriesId)) {
      return Response.json(
        { message: "Invalid series id" },
        { status: 400 }
      );
    }

    const series = await prisma.series.findUnique({
      where: { id: seriesId },
      include: {
        episodes: {
          orderBy: { episodeNo: "asc" },
          ...(limitParam ? { skip, take: limit } : {}),
        },
      },
    });

    if (!series) {
      return Response.json(
        { message: "Series not found" },
        { status: 404 }
      );
    }

    const total = await prisma.episode.count({
      where: { seriesId },
    });

    return Response.json({
      data: series,
      total,
      totalPages: Math.ceil(total / limit),
      page,
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      { message: "Failed to get series" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const seriesId = Number(params.id);

    if (isNaN(seriesId)) {
      return Response.json(
        { message: "Invalid or missing Series ID" },
        { status: 400 }
      );
    }

    await removeSeries(seriesId);

    return Response.json({
      message:
        "Series and all its related episodes have been deleted successfully",
    });
  } catch (error: unknown) {
    console.error(error);

    const message =
      error instanceof Error ? error.message : "Unknown error";

    return Response.json(
      {
        message: "Failed to delete series",
        error: message,
      },
      { status: 500 }
    );
  }
}