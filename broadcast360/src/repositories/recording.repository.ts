import { prisma } from "@/lib/prisma";

export class RecordingRepository {
  async create(data: {
    channelId: number;
    title: string;
    fileUrl: string;
    startedAt: Date;
    endedAt: Date;
  }) {
    return prisma.recording.create({
      data: {
        channelId: data.channelId,

        title: data.title,

        fileUrl: data.fileUrl,

        duration: 0,

        startedAt: data.startedAt,

        endedAt: data.endedAt,
      },
    });
  }

  async complete(
    id: number,
    data: {
      endedAt: Date;
      duration: number;
    },
  ) {
    return prisma.recording.update({
      where: {
        id,
      },

      data: {
        endedAt: data.endedAt,

        duration: data.duration,
      },
    });
  }

  async findById(id: number) {
    return prisma.recording.findUnique({
      where: {
        id,
      },
    });
  }

  async findByChannel(channelId: number) {
    return prisma.recording.findMany({
      where: {
        channelId,
      },

      orderBy: {
        createdAt: "desc",
      },
    });
  }
}
