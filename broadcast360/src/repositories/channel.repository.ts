import { prisma } from "@/lib/prisma";

export function getAllChannels() {
  return prisma.channel.findMany();
}

export function getChannelById(id:number){

  return prisma.channel.findUnique({
    where:{id :id },
    include:{
      streams:true,
      programs:true,
      news:true,
      recordings:true
    }
  });
}

