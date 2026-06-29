import { fetchSeriesById } from "@/services/series.service";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // ✅ FIX HERE
    const { id } = await params;

    const { searchParams } = new URL(request.url);

    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 5);
    const skip = (page - 1) * limit;

    const series = await fetchSeriesById(Number(id), {
      skip,
      take: limit,
    });

    const totalEpisodes = await prisma.episode.count({
      where: { seriesId: Number(id) },
    });

    return Response.json({
      data: series,
      totalPages: Math.ceil(totalEpisodes / limit),
      page,
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      { message: "Failed to get series by id" },
      { status: 500 }
    );
  }
}