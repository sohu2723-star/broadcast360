import { prisma } from "@/lib/prisma";


export async function getPaginatedMovies({ page, limit }: { page: number; limit: number }) {
  const skip = (page - 1) * limit;

  //transaction to get better performance
  const [data, total] = await prisma.$transaction([
    prisma.movie.findMany({
      skip,
      take: limit,
      include: {
        programs: {
          select: {
            id: true,
            title: true, 
          },
        },
      },
      orderBy: { 
        createdAt: 'desc' // To show latest movies uploaded first
      },
    }),
    prisma.movie.count(),
  ]);

  return { data, total };
}

export function getMovieById(id: number) {
  return prisma.movie.findUnique({
    where: { id },
    include: {
      programs: true, 
    },
  });
}

export function deleteMovie(id: number) {
  return prisma.movie.delete({
    where: { id },
  });
}