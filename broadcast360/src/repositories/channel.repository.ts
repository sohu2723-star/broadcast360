import { prisma } from "@/lib/prisma";

//query
export async function getPaginatedChannels({
  page,
  limit,
  search,
}: {
  page: number;
  limit: number;
  search?: string;
}) {
  const skip = (page - 1) * limit;

  // Search Clause
  const whereClause = search
    ? {
        OR: [
          {
            name: {
              contains: search,
              mode: "insensitive" as const,
            },
          },
          {
            country: {
              contains: search,
              mode: "insensitive" as const,
            },
          },
        ],
      }
    : {};

  // $transaction to get better performance
  const [data, total] = await prisma.$transaction([
    prisma.channel.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: {
        id: "desc",
      },
    }),
    prisma.channel.count({
      where: whereClause,
    }),
  ]);

  return { data, total };
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

