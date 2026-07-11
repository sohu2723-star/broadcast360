import { prisma } from "@/lib/prisma";
import { CreateProgramInput, UpdateProgramInput } from "@/types/program";


export function createProgram(
  data:CreateProgramInput
){

 return prisma.program.create({
  data:{
    channelId:data.channelId,
    title:data.title,
    type:data.type,
    description:data.description,
  },

  include:{
    channel:true
  }

 });

}

export async function getProgramById(id: number) {
  return prisma.program.findUnique({
    where: { id },
    include: {
      channel: true,
      playlists: {
        select: {
          id: true,
          name: true,
          totalDuration: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });
}


export function updateProgram(
  id:number,
  data:UpdateProgramInput
){
  return prisma.program.update({
    where:{
      id
    },
    data
  });
}


export function getProgramDetails(
  id:number
){

  return prisma.program.findUnique({

    where:{
      id:id
    },


    include:{

      channel:true,
      playlists:{
        select:{
          id:true,
          name:true,
          totalDuration:true,
          createdAt:true
        },
        orderBy:{
          createdAt:"desc"

        }

      }

    }

  });

}

// program repository for database operations
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




