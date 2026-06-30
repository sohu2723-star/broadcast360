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



export function getProgramById(id:number){
  return prisma.program.findUnique({
    where:{
      id
    },
    include:{
      channel:true
    }
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