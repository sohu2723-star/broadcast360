import { prisma } from "@/lib/prisma";

// =====================================================
// GET ALL EPISODES BY SERIES
// =====================================================

export function getEpisodesBySeriesId(
  seriesId: number,
) {
  return prisma.episode.findMany({
    where: {
      seriesId,
    },

    orderBy: [
      {
        episodeNo: "asc",
      },
      {
        id: "asc",
      },
    ],
  });
}

// =====================================================
// GET SINGLE EPISODE
// =====================================================

export async function getEpisodeById(
  id: number,
) {
  return prisma.episode.findUnique({
    where: {
      id,
    },
  });
}

// =====================================================
// GET SERIES
// =====================================================

export async function getSeriesById(
  seriesId: number,
) {
  return prisma.series.findUnique({
    where: {
      id: seriesId,
    },

    select: {
      id: true,
      title: true,
    },
  });
}

// =====================================================
// GET SAME EPISODE NUMBER
// =====================================================

export function getEpisodesBySeriesAndEpisodeNo(
  seriesId: number,
  episodeNo: number,
) {
  return prisma.episode.findMany({
    where: {
      seriesId,
      episodeNo,
    },

    select: {
      id: true,
      title: true,
      episodeNo: true,
    },
  });
}

// =====================================================
// FIND DUPLICATE TITLE
// =====================================================

export function findEpisodeByTitle(
  seriesId: number,
  episodeNo: number,
  title: string,
  excludeId?: number,
) {
  return prisma.episode.findFirst({
    where: {
      seriesId,
      episodeNo,
      title,

      ...(excludeId !== undefined
        ? {
            id: {
              not: excludeId,
            },
          }
        : {}),
    },
  });
}

// =====================================================
// CREATE
// =====================================================

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

// =====================================================
// UPDATE
// =====================================================

export function updateEpisode(
  id: number,
  data: {
    title?: string;
    episodeNo?: number;
    duration?: number;
    videoUrl?: string | null;
    thumbnailUrl?: string | null;
  },
) {
  return prisma.episode.update({
    where: {
      id,
    },

    data,
  });
}

// =====================================================
// DELETE
// =====================================================

export function deleteEpisode(
  id: number,
) {
  return prisma.episode.delete({
    where: {
      id,
    },
  });
}
