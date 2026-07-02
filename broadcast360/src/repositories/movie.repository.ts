import { prisma } from "@/lib/prisma";

export async function getPaginatedMovies({ 
  page, 
  limit, 
  search 
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
          
        ],
      }
    : {};

  const [data, total] = await prisma.$transaction([
    prisma.movie.findMany({
      where: whereClause, 
      skip,
      take: limit,
      orderBy: { 
        createdAt: 'desc' 
      },
    }),
    prisma.movie.count({
      where: whereClause, 
    }),
  ]);

  return { data, total };}
  

export function getAllMovies() {
  return prisma.movie.findMany();
}

export function getMovieById(id: number) {
  return prisma.movie.findUnique({
    where: { id : id },
  });
}

export function deleteMovie(id: number) {
  return prisma.movie.delete({
    where: { id : id },
  });
}