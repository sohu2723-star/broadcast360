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