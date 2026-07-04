import { prisma } from "@/lib/prisma";
import type { MovieCreateInput, MovieUpdateInput } from "@/types/movie";

/* -------------------------
   PAGINATED MOVIES
--------------------------*/
export async function getPaginatedMovies({
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
        title: {
          contains: search,
          mode: "insensitive" as const,
        },
      }
    : {};

  const [data, total] = await prisma.$transaction([
    prisma.movie.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.movie.count({ where: whereClause }),
  ]);

  return { data, total };
}

/* -------------------------
   GET BY ID
--------------------------*/
export function getMovieById(id: number) {
  return prisma.movie.findUnique({
    where: { id },
  });
}

/* -------------------------
   CREATE MOVIE
--------------------------*/
export function createMovie(data: MovieCreateInput) {
  return prisma.movie.create({
    data,
  });
}

/* -------------------------
   UPDATE MOVIE
--------------------------*/
export function updateMovie(
  id: number,
  data: MovieUpdateInput
) {
  return prisma.movie.update({
    where: { id },
    data,
  });
}

/* -------------------------
   DELETE MOVIE
--------------------------*/
export function deleteMovie(id: number) {
  return prisma.movie.delete({
    where: { id },
  });
}