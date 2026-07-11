import { SessionManager } from "@/managers/session.manager";
import { FFmpegManager } from "@/managers/ffmpeg.manager";
import { getDefaultPlaylist } from "@/repositories/channel.repository";
import { ScheduleWithRelations } from "@/types/schedule.types";
import { PlaylistItemWithRelations } from "@/types/playlist";
import { BroadcastStateManager } from "@/managers/broadcast-state.manager";
import { PlayoutQueueManager } from "@/managers/playout-queue.manager";
import { PlaylistResolverService } from "@/services/playlist-resolver.service";
import path from "path";

export class BroadcastService {
  private session = new SessionManager();

  private ffmpeg = new FFmpegManager();

  private state = new BroadcastStateManager();

  private playout = new PlayoutQueueManager();

  private resolver = new PlaylistResolverService();

  private currentItems = new Map<number, PlaylistItemWithRelations>();

  /**
   * START CHANNEL BROADCAST
   */
  async start(schedule: ScheduleWithRelations | null, channelId: number) {
    if (this.session.isLive(channelId)) {
      console.log("⚠ Channel already live");

      return;
    }

    let playlist;

    /*
      1. Scheduled playlist
    */

    if (schedule?.playlist) {
      playlist = schedule.playlist;

      console.log("📺 Schedule playlist:", playlist.name);
    } else {
      /*
      2. Fallback playlist
    */
      const channel = await getDefaultPlaylist(channelId);

      playlist = channel?.defaultPlaylist;

      if (!playlist) {
        console.log("⚠ No fallback playlist");

        return;
      }

      console.log("🔁 Fallback playlist:", playlist.name);
    }

    const items = playlist.items ?? [];

    if (items.length === 0) {
      console.log("⚠ Playlist empty");

      return;
    }

    console.log("📺 Items:", items.length);

    /*
      Load queue

      A
      B
      C

      becomes

      A
      B
      C
      A
      B
      C

    */

    this.playout.load(channelId, items);

    this.session.start(channelId);

    this.currentItems.set(channelId, items[0]);

    this.state.start(channelId, items[0]);

    await this.playNext(channelId);

    console.log(`▶ Channel ${channelId} started`);
  }

  /**
   * PLAY NEXT VIDEO
   */
  private async playNext(channelId: number) {
    const item = this.playout.next(channelId);

    if (!item) {
      console.log("⚠ Queue empty");
      return;
    }

    const video = this.resolver.resolve(item);

    if (!video) {
      console.log("⚠ Cannot resolve video item:", item.id);

      await this.playNext(channelId);

      return;
    }

    const fullPath = path.join(process.cwd(), "public", video);

    console.log("▶ Playing:", video);

    const ffmpeg = this.ffmpeg.playSingle(
      channelId,
      fullPath,
      `./public/streams/channel-${channelId}`,
    );

    if (!ffmpeg) {
      console.log("❌ FFmpeg failed");

      return;
    }

    ffmpeg.once("close", async (code) => {
      console.log(`✔ Finished video channel ${channelId}`, code);

      await this.playNext(channelId);
    });
  }

  /**
   * SWITCH SCHEDULE
   */
  async switchBroadcast(
    schedule: ScheduleWithRelations | null,
    channelId: number,
  ) {
    console.log("🔄 Switching playlist channel", channelId);

    // clear old queue

    this.playout.clear(channelId);

    this.ffmpeg.stop(channelId);

    this.session.stop(channelId);

    this.currentItems.delete(channelId);

    await this.start(schedule, channelId);
  }

  /**
   * STOP
   */
  stop(channelId: number) {
    this.ffmpeg.stop(channelId);

    this.playout.clear(channelId);

    this.session.stop(channelId);

    this.currentItems.delete(channelId);

    console.log("🛑 Broadcast stopped", channelId);
  }

  getCurrentItem(channelId: number) {
    return this.currentItems.get(channelId);
  }
}
