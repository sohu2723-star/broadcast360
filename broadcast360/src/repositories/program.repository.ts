import { prisma } from "@/lib/prisma";
import { CreateProgramInput } from "@/types/program";


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