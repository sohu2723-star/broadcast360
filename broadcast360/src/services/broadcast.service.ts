import { FFmpegManager } from "@/managers/ffmpeg.manager";
import { getDefaultPlaylist } from "@/repositories/channel.repository";
import { ScheduleWithRelations } from "@/types/schedule.types";
import { PlaylistItemWithRelations } from "@/types/playlist";
import { BroadcastStateManager } from "@/managers/broadcast-state.manager";
import { PlayoutQueueManager } from "@/managers/playout-queue.manager";
import { PlaylistResolverService } from "@/services/playlist-resolver.service";
import { ScheduleRepository } from "@/repositories/schedule.repository";
import path from "path";

export class BroadcastService {
  private ffmpeg = new FFmpegManager();

  private state = new BroadcastStateManager();

  private playout = new PlayoutQueueManager();

  private resolver = new PlaylistResolverService();

  private currentItems = new Map<number, PlaylistItemWithRelations>();

  async start(schedule: ScheduleWithRelations | null, channelId: number) {
    if (this.ffmpeg.isRunning(channelId)) {
      console.log("⚠ FFmpeg already running");

      return;
    }

    let playlist;

    if (schedule?.playlist) {
      playlist = schedule.playlist;

      console.log("📺 Schedule:", playlist.name);
    } else {
      const channel = await getDefaultPlaylist(channelId);

      playlist = channel?.defaultPlaylist;

      if (!playlist) {
        console.log("⚠ No fallback playlist");

        return;
      }

      console.log("🔁 Fallback:", playlist.name);
    }

    const items = playlist.items ?? [];

    if (items.length === 0) {
      console.log("⚠ Empty playlist");

      return;
    }

    console.log("📦 Items:", items.length);

    this.playout.load(channelId, items);

    this.currentItems.set(channelId, items[0]);

    this.state.start(channelId, items[0]);

    await this.playNext(channelId);

    if (schedule) {
      await ScheduleRepository.updateStatus(schedule.id, "LIVE");
    }

    console.log(`▶ Channel ${channelId} started`);
  }

 private async playNext(channelId: number): Promise<void> {
    const item = this.playout.next(channelId);

    if (!item) {
      console.log("⚠ No next item");

      return;
    }

    this.currentItems.set(channelId, item);

    const video = this.resolver.resolve(item);

    console.log("🎥 Video:", video);

    if (!video) {
      console.log("⚠ Cannot resolve");

      return this.playNext(channelId);
    }

    const fullPath = path.join(process.cwd(), "public", video);

    console.log("📂 File:", fullPath);

    const ffmpeg = this.ffmpeg.playSingle(
      channelId,
      fullPath,
      `./public/streams/channel-${channelId}`,
    );

    if (!ffmpeg) {
      console.log("❌ FFmpeg failed");

      return;
    }

    console.log("🚀 FFmpeg started");

    ffmpeg.once("close", async (code) => {
      console.log("FFmpeg closed", code);

      if (code === 0) {
        await this.playNext(channelId);
      }
    });
  }

  async switchBroadcast(
    schedule: ScheduleWithRelations | null,
    channelId: number,
  ) {
    console.log("🔄 Switch", channelId);

    let playlist;

    if (schedule?.playlist) {
      playlist = schedule.playlist;
    } else {
      const channel = await getDefaultPlaylist(channelId);

      playlist = channel?.defaultPlaylist;
    }

    if (!playlist) {
      console.log("⚠ No playlist");

      return;
    }

    this.playout.replace(channelId, playlist.items);

    /*
       Important recovery
    */

    if (!this.ffmpeg.isRunning(channelId)) {
      console.log("🔄 FFmpeg dead. Restarting");

      await this.playNext(channelId);
    }
  }

  async stop(channelId: number) {
    this.ffmpeg.stop(channelId);

    this.playout.clear(channelId);

    this.currentItems.delete(channelId);

    console.log("🛑 stopped", channelId);
  }

  isRunning(channelId: number) {
    return this.ffmpeg.isRunning(channelId);
  }
}
