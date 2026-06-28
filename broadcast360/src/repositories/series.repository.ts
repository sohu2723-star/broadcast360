import { prisma } from "@/lib/prisma";

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
                    skip,
                    take: limit,
                    include: {
                        _count: {
                        select: { episodes: true }, 
                        },
                    },
                    orderBy: {
                        id: "desc",
                    },
                    }),
                    prisma.series.count({
                    where: whereClause,
                    }),
                ]);

 
  const formattedData = data.map((item) => ({
    id: item.id,
    title: item.title,
    genre: item.genre,
    thumbnail: item.thumbnail,
    episodeCount: item._count.episodes, // Mapping to episodeCount
    createdAt: item.createdAt,
  }));

  return { data: formattedData, total };
}

export async function deleteSeries(id: number) {
  return prisma.$transaction(async (tx) => {
    //delete all episodes first
    await tx.episode.deleteMany({
      where: {
        seriesId: id,
      },
    });

    return await tx.series.delete({
      where: {
        id: id,
      },
    });
  });
}