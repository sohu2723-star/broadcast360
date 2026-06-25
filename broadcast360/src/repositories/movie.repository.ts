import { prisma } from "@/lib/prisma";

export function getAllMovies() {
  return prisma.movie.findMany();
}

export function getMovieById(id: number) {
  return prisma.movie.findUnique({
    where: {
      id: id,
    },
  });
}