import { prisma } from "@/lib/prisma";

export async function getEpisodeById(id: number) {
  return prisma.episode.findUnique({
    where: { id },
  });
}

export async function deleteEpisode(id: number) {
  return prisma.episode.delete({
    where: { id },
  });
}