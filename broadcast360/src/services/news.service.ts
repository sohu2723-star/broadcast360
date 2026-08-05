import { prisma } from "@/lib/prisma";

export class NewsService {
  async createFromRecording(recordingId: number) {
    const recording = await prisma.recording.findUnique({
      where: {
        id: recordingId,
      },
    });

    if (!recording) throw new Error("Recording not found");

    return prisma.news.create({
      data: {
        channelId: recording.channelId,

        recordingId: recording.id,

        title: recording.title,

        videoUrl: recording.fileUrl,

        duration: recording.duration,

        type: "Recorded VIDEO",
      },
    });
  }
}
