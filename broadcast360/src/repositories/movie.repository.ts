import { prisma } from "@/lib/prisma";
export class MovieRepository {
  async findMany({ page, limit }: { page: number; limit: number }) {
    const skip = (page - 1) * limit;
    const take = limit;

    const [data, total] = await prisma.$transaction([
      prisma.movie.findMany({
        skip,
        take,
        include: {
          programs: true, 
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.movie.count(),
    ]);

    return { data, total };
  }
}