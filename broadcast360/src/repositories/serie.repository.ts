import { prisma } from "@/lib/prisma";

export function getSeries() {
  return prisma.series.findMany();
}

export function getSeriesById(id: number) {
  return prisma.series.findUnique({
    where: { id },
  });
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
  }
) {
  return prisma.series.update({
    where: { id },
    data,
  });
}

export function deleteSeries(id: number) {
  return prisma.series.delete({
    where: { id },
  });
}