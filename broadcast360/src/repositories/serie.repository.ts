import { prisma } from "@/lib/prisma";

export function getSeries() {
  return prisma.series.findMany();
}

/**
 * Get single series by ID
 */
export async function getSeriesById(
  id: number,
  opts?: { skip: number; take: number },
) {
  const series = await prisma.series.findUnique({
    where: { id },
    include: {
      episodes: {
        skip: opts?.skip,
        take: opts?.take,
        orderBy: { episodeNo: "asc" },
      },

      _count: {
        select: { episodes: true },
      },
    },
  });

  if (!series) return null;

  const allEpisodes = await prisma.episode.findMany({
    where: { seriesId: id },
    select: { episodeNo: true },
  });

  const uniqueEpisodes = new Set(
    allEpisodes
      .map((ep) => ep.episodeNo)
      .filter((epNo) => epNo !== null && epNo !== undefined),
  );

  return {
    ...series,
    episodeCount: uniqueEpisodes.size, // Unique Episodes count (e.g., 2)
    partCount: series._count.episodes, // Total Parts count (e.g., 4)
  };
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
          select: {
            createdAt: true,
            episodeNo: true, // Fetch episode numbers to calculate unique count
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        _count: {
          select: { episodes: true }, // Total parts count
        },
      },
    }),
    prisma.series.count({
      where: whereClause,
    }),
  ]);

  // 1. Sort by latest episode or series creation date
  const sortedData = data.sort((a, b) => {
    const latestA = a.episodes[0]?.createdAt ?? a.createdAt;
    const latestB = b.episodes[0]?.createdAt ?? b.createdAt;

    return new Date(latestB).getTime() - new Date(latestA).getTime();
  });

  const paginatedData = sortedData.slice(skip, skip + limit);

  // 3. Format only the paginated slice
  const formattedData = paginatedData.map((item) => {
    // Collect all unique episodeNo values
    const uniqueEpisodeNumbers = new Set(
      item.episodes
        .map((ep) => ep.episodeNo)
        .filter((epNo) => epNo !== null && epNo !== undefined),
    );

    return {
      id: item.id,
      title: item.title,
      genre: item.genre,
      thumbnail: item.thumbnail,
      episodeCount: uniqueEpisodeNumbers.size, // Unique episode count
      partCount: item._count.episodes, // Total parts count
      createdAt: item.createdAt,
    };
  });

  return { data: formattedData, total };
}

/* CREATE*/
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
export async function findSeriesByTitle(title: string) {
  return prisma.series.findFirst({
    where: {
      title: {
        equals: title.trim(),
        mode: "insensitive",
      },
    },
    select: {
      id: true,
      title: true,
    },
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