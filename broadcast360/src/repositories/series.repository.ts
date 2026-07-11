import { prisma } from "@/lib/prisma";

export async function getSeriesById(
  id: number,
  skip = 0,
  take = 5
) {
  return prisma.series.findUnique({
    where: { id },
    include: {
      episodes: {
        orderBy: { episodeNo: "asc" },
        skip,
        take,
      },
    },
  });
}