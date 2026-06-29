import { prisma } from "@/lib/prisma";

export function getSeriesById(
  id: number,
  opts?: { skip: number; take: number }
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