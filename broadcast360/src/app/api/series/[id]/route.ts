import { prisma } from "@/lib/prisma";

// GET series by id
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);

    const { searchParams } = new URL(request.url);

    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 5);
    const skip = (page - 1) * limit;

    const series = await prisma.series.findUnique({
      where: { id },
      include: {
        episodes: {
          skip,
          take: limit,
          orderBy: { episodeNo: "asc" },
        },
      },
    });

    if (!series) {
      return Response.json({ data: null });
    }

    const totalEpisodes = await prisma.episode.count({
      where: { seriesId: id },
    });

    return Response.json({
      data: series,
      totalPages: Math.ceil(totalEpisodes / limit),
      page,
    });
  } catch (error) {
    return Response.json(
      { message: "Failed to get series" },
      { status: 500 }
    );
  }
}