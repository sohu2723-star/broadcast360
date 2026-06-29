import { prisma } from "@/lib/prisma";

export function getSeriesById(id: number) {
  return prisma.series.findUnique({
    where: {
      id,
    },
    include: {
      episodes: true,
    },
  });
}