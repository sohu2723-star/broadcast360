import { prisma } from "@/lib/prisma";

interface ProgramStorageData {
  title: string;
  type: string;
  description: string;
  channelId: number; 
}

class ProgramRepository {
  public async findMany(filters: { search?: string; type?: string; channelName?: string; page?: number; limit?: number }) {
    const whereConditions: any = {};

    // Pagination
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;
    const take = limit;
    
    if (filters.search) {
      whereConditions.OR = [
        { title: { contains: filters.search, mode: "insensitive" } }
      ];
    }

    if (filters.type) {
      whereConditions.type = filters.type;
    }

    if (filters.channelName) {
      whereConditions.channel = {
        name: { equals: filters.channelName, mode: "insensitive" }
      };
    }

    return await prisma.program.findMany({
      where: whereConditions,
      skip: skip,
      take: take,
      include: {
        channel: true,
      },
      orderBy: {
        id: "desc"
      }
    });
  }

  public async findById(id: number) {
    return await prisma.program.findUnique({
      where: { id },
    });
  }

  public async delete(id: number) {
    return await prisma.program.delete({
      where: { id },
    });
  }
}

export const programRepository = new ProgramRepository();