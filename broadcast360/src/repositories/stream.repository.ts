import { prisma } from "@/lib/prisma";
import { StreamProtocol, StreamStatus } from "@/generated/prisma/client";
import { Prisma } from "@/generated/prisma/client";

export const StreamRepository = {
  async findAllPaginated({
    page,
    limit,
    search,
  }: {
    page: number;
    limit: number;
    search?: string;
  }) {
    const skip = (page - 1) * limit;

    const where: Prisma.StreamWhereInput = search
      ? {
        OR: [
          {
            name: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            url: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            channel: {
              name: {
                contains: search,
                mode: "insensitive",
              },
            },
          },
        ],
      }
      : {};

    const [data, total] = await prisma.$transaction([
      prisma.stream.findMany({
        where,

        include: {
          channel: true,
        },

        orderBy: {
          createdAt: "desc",
        },

        skip,

        take: limit,
      }),

      prisma.stream.count({
        where,
      }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  findById(id: number) {
    return prisma.stream.findUnique({
      where: {
        id,
      },

      include: {
        channel: true,
      },
    });
  },

  findByChannel(channelId: number) {
    return prisma.stream.findMany({
      where: {
        channelId,
      },

      include: {
        channel: true,
      },

      orderBy: {
        createdAt: "desc",
      },
    });
  },

  create(data: {
    channelId: number;
    name: string;
    url: string;
    protocol: StreamProtocol;
    description?: string | null;
  }) {
    return prisma.stream.create({
      data,

      include: {
        channel: true,
      },
    });
  },

  update(
  id:number,

  data:{
    channelId?:number;
    name?:string;
    url?:string;
    protocol?:StreamProtocol;
    status?:StreamStatus;
    description?:string|null;
  }

){

  return prisma.stream.update({

    where:{
      id
    },

    data,

    include:{
      channel:true
    }

  });

},
  delete(id: number) {
    return prisma.stream.delete({
      where: {
        id,
      },
    });
  },
};
