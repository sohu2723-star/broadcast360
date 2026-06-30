import { prisma } from "@/lib/prisma";

// ========================
// GET ALL EPISODES BY SERIES
// ========================
export function getEpisodesBySeriesId(seriesId: number) {
  return prisma.episode.findMany({
    where: { seriesId },
    orderBy: {
      episodeNo: "asc",
    },
  });
}

// ========================
// GET SINGLE EPISODE
// ========================
export function getEpisodeById(id: number) {
  return prisma.episode.findUnique({
    where: { id },
  });
}

// ========================
// CREATE EPISODE
// ========================
export function createEpisode(data: {
  seriesId: number;
  title: string;
  episodeNo: number;
  duration: number;
  videoUrl?: string | null;
  thumbnailUrl?: string | null;
}) {
  return prisma.episode.create({
    data,
  });
}

// ========================
// UPDATE EPISODE
// ========================
export function updateEpisode(
  id: number,
  data: {
    title?: string;
    episodeNo?: number;
    duration?: number;
    videoUrl?: string | null;
    thumbnailUrl?: string | null;
  }
) {
  return prisma.episode.update({
    where: { id },
    data,
  });
}

// ========================
// DELETE EPISODE
// ========================
export function deleteEpisode(id: number) {
  return prisma.episode.delete({
    where: { id },
  });
}