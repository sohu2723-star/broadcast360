import { ScheduleRepository } from "@/repositories/schedule.repository";
import { SessionManager } from "@/managers/session.manager";
import { FFmpegManager } from "@/managers/ffmpeg.manager";
import { PlaylistResolverService } from "@/services/playlist-resolver.service";
import { ScheduleWithRelations } from "@/types/schedule.types";

export class BroadcastService {
  private session = new SessionManager();
  private ffmpeg = new FFmpegManager();
  private resolver = new PlaylistResolverService();

  /**
   * MAIN ENTRY POINT FROM SCHEDULER
   */
  async start(schedule: ScheduleWithRelations) {
    const channelId = schedule.channelId;

    console.log("PLAYLIST:", schedule.playlist);
    console.log("ITEMS:", schedule.playlist?.items);
    // 1. prevent duplicate broadcast
    if (this.session.isLive(channelId)) {
      console.log("⚠ Channel already live");
      return;
    }

    // 2. validate playlist
    if (!schedule.playlist?.items?.length) {
      console.log("⚠ No playlist items");
      return;
    }

    // 3. create session
    this.session.start(channelId);

    // 4. resolve playlist → video URLs
    const inputs = this.resolver.resolve(schedule.playlist.items);

    const outputDir = `./public/streams/channel-${channelId}`;

    // 5. start FFmpeg HLS
    const pid = this.ffmpeg.start(channelId, inputs, outputDir);

    console.log(`📺 Broadcast started for channel ${channelId}, PID: ${pid}`);
  }

  /**
   * STOP BROADCAST
   */
  stop(channelId: number) {
    this.ffmpeg.stop(channelId);
    this.session.stop(channelId);

    console.log(`🛑 Broadcast stopped for channel ${channelId}`);
  }
}