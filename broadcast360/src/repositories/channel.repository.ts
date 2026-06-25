import { prisma } from "@/lib/prisma";

//query
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

    prisma.adPolicy.deleteMany({
      where:{
        program:{
          channelId:id
        }
      }
    }),

    prisma.playlistItem.deleteMany({
      where:{
        program:{
          channelId:id
        }
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

    prisma.broadcastSession.deleteMany({
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

