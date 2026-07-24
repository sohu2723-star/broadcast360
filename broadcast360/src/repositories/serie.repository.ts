import { prisma } from "@/lib/prisma";

export function getSeries() {
  return prisma.series.findMany();
}

/**
 * Get single series by ID
 */
export function getSeriesById(
  id: number,
  opts?: { skip: number; take: number },
) {
  return prisma.series.findUnique({
    where: { id },
    include: {
      episodes: {
        skip: opts?.skip,
        take: opts?.take,
        orderBy: { episodeNo: "asc" },
      },
    },
  });
}

/**
 * Get paginated series list with search
 */
export async function getPaginatedSeries({
  page,
  limit,
  search,
}: {
  page: number;
  limit: number;
  search?: string;
}) {
  const skip = (page - 1) * limit;

  const whereClause = search
    ? {
        OR: [
          {
            title: {
              contains: search,
              mode: "insensitive" as const,
            },
          },
          {
            genre: {
              contains: search,
              mode: "insensitive" as const,
            },
          },
        ],
      }
    : {};

  const [data, total] = await prisma.$transaction([
    prisma.series.findMany({
      where: whereClause,
      include: {
        episodes: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
          select: {
            createdAt: true,
          },
        },
        _count: {
          select: { episodes: true },
        },
      },
    }),
    prisma.series.count({
      where: whereClause,
    }),
  ]);

  const sortedData = data.sort((a, b) => {
    const latestA = a.episodes[0]?.createdAt ?? a.createdAt;
    const latestB = b.episodes[0]?.createdAt ?? b.createdAt;

    return new Date(latestB).getTime() - new Date(latestA).getTime();
  });

  const formattedData = sortedData.map((item) => ({
    id: item.id,
    title: item.title,
    genre: item.genre,
    thumbnail: item.thumbnail,
    episodeCount: item._count.episodes,
    createdAt: item.createdAt,
  }));

  return { data: formattedData, total };
}

/* =========================
   CREATE
========================= */
export function createSeries(data: {
  title: string;
  description: string;
  genre: string;
  releaseYear: number;
  thumbnail: string;
}) {
  return prisma.series.create({
    data,
  });
}

/* =========================
   UPDATE
========================= */
export function updateSeries(
  id: number,
  data: {
    title: string;
    description: string;
    genre: string;
    releaseYear: number;
    thumbnail?: string; // optional for edit
  },
) {
  return prisma.series.update({
    where: { id },
    data,
  });
}

/**
 * Delete series + all episodes
 */
export async function deleteSeries(id: number) {
  return prisma.$transaction(async (tx) => {
    // delete episodes first
    await tx.episode.deleteMany({
      where: { seriesId: id },
    });

    return await tx.series.delete({
      where: { id },
    });
  });
}
