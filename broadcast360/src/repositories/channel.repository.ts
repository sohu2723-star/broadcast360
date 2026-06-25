import { prisma } from "@/lib/prisma";


type CreateChannelInput = {
  name:string;
  description?:string;
  logo?:string;
  country?:string;
};

type UpdateChannelInput = {
  name?:string;
  description?:string;
  logo?:string;
  country?:string;
};

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

export function createChannel(data: CreateChannelInput) {
  return prisma.channel.create({
    data
  });
}

export function updateChannel(
  id: number,
  data: UpdateChannelInput){
  return prisma.channel.update({
    where:{id},
    data
  });
}

// export function deleteChannel(id:number){
//   return prisma.channel.delete({
//     where:{id}});
// }

export async function deleteChannel(id:number){
  return prisma.$transaction([
    prisma.stream.deleteMany({
      where:{
        channelId:id
      }
    }),
    prisma.program.deleteMany({
      where:{
        channelId:id
      }
    }),
    prisma.news.deleteMany({
      where:{
        channelId:id
      }
    }),
    prisma.recording.deleteMany({
      where:{
        channelId:id
      }
    }),
    prisma.channel.delete({
      where:{
        id
      }
    })
  ]);
}