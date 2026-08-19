import { RecordingManager } from "@/managers/recording-manager";
import { NewsRepository } from "@/repositories/news.repository";

export class RecordingService {
  constructor(private manager: RecordingManager) {}

  async start(channelId: number, streamKey: string, title: string) {
    return this.manager.start(channelId, streamKey, title);
  }

  async stop(channelId: number) {
    const result = await this.manager.stop(channelId);

    if (!result) {
      return null;
    }

    const news = await NewsRepository.create({
      channelId,

      title: result.title,

      videoUrl: result.output,

      duration: result.duration,

      type: "VIDEO",
    });

    console.log("📰 NEWS CREATED", news.id);

    return news;
  }
}
