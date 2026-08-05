import { prisma } from "@/lib/prisma";

export class NewsRepository {
  static async create(data: {
    channelId: number;
    title: string;
    videoUrl: string;
    duration: number;
    type: string;
  }) {
    return prisma.news.create({
      data: {
        channelId: data.channelId,

        title: data.title,

        videoUrl: data.videoUrl,

        duration: data.duration,

        type: data.type,
      },
    });
  }

  static async findAll(channelId?: number) {
    return prisma.news.findMany({
      where: {
        channelId,
      },

      orderBy: {
        createdAt: "desc",
      },
    });
  }

  static async findById(id: number) {
    return prisma.news.findUnique({
      where: {
        id,
      },
    });
  }
}
