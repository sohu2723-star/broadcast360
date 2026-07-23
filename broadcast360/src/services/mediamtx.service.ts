import {
  getDefaultPlaylist,
  getChannelBroadcastInfo,
} from "@/repositories/channel.repository";

import { ScheduleWithRelations } from "@/types/schedule.types";

import { PlaylistResolverService } from "@/services/playlist-resolver.service";

import { PlayoutQueueManager } from "@/managers/playout-queue.manager";

import { SwitchManager } from "@/managers/switch-manager";

import { ScheduleCatchupService } from "@/services/schedule-catchup.service";

import { ScheduleRepository } from "@/repositories/schedule.repository";

import path from "path";

export class BroadcastService {
  private switcher = new SwitchManager();

  private playout = new PlayoutQueueManager();

  private resolver = new PlaylistResolverService();

  private catchup = new ScheduleCatchupService();

  private preloadCache = new Map<number, ScheduleWithRelations>();

  private startOffsets = new Map<number, number>();

  private queueMode = new Map<number, "SCHEDULE" | "FALLBACK">();

  /**
   * Prevent double playNext
   */
  private playing = new Map<number, boolean>();

  async start(schedule: ScheduleWithRelations | null, channelId: number) {
    const channel = await getChannelBroadcastInfo(channelId);

    if (!channel?.streamKey) {
      console.log("❌ Missing stream key");

      return;
    }

    const playlist = await this.getPlaylist(schedule, channelId);

    if (!playlist) {
      return;
    }

    const mode = schedule ? "SCHEDULE" : "FALLBACK";

    this.queueMode.set(channelId, mode);

    this.playout.load(channelId, playlist.items ?? [], mode);

    await this.playNext(channelId, channel.streamKey);

    if (schedule) {
      await ScheduleRepository.updateStatus(schedule.id, "LIVE");
    }

    console.log("▶ Broadcast started", channelId);
  }

  private async getPlaylist(
    schedule: ScheduleWithRelations | null,
    channelId: number,
  ) {
    if (schedule?.playlist) {
      console.log("📺 Schedule playlist", schedule.playlist.name);

      return schedule.playlist;
    }

    const fallback = await getDefaultPlaylist(channelId);

    return fallback?.defaultPlaylist ?? null;
  }

  private async playNext(channelId: number, streamKey: string): Promise<void> {
    /**
     * prevent duplicate
     */
    if (this.playing.get(channelId)) {
      console.log("⚠ Already switching", channelId);

      return;
    }

    this.playing.set(channelId, true);

    try {
      const item = this.playout.next(channelId);

      if (!item) {
        console.log("📺 Queue finished");

        return;
      }

      console.log("▶ PLAY", {
        id: item.id,
        type: item.type,
        order: item.order,
      });

      /**
       * LIVE
       */
      if (item.type === "STREAM") {
        if (!item.stream) {
          return this.playNext(channelId, streamKey);
        }

        await this.switcher.startLIVE(channelId, item.stream);

        this.monitorLive(channelId, streamKey);

        return;
      }

      /**
       * VOD
       */
      const video = this.resolver.resolve(item);

      if (!video) {
        return this.playNext(channelId, streamKey);
      }

      const fullPath = path.join(process.cwd(), "public", video);

      const offset = this.startOffsets.get(channelId) ?? 0;

      this.startOffsets.delete(channelId);

      const ffmpeg = await this.switcher.startVOD(
        channelId,
        fullPath,
        streamKey,
        offset,
      );

      if (!ffmpeg) {
        return;
      }

      ffmpeg.once("close", async (code) => {
        console.log("🎬 VOD END", {
          channelId,
          code,
        });

        /**
         * continue queue
         */
        await this.playNext(channelId, streamKey);
      });
    } finally {
      this.playing.set(channelId, false);
    }
  }

  async switchBroadcast(
    schedule: ScheduleWithRelations | null,
    channelId: number,
  ) {
    let playlist;

    if (schedule?.playlist) {
      playlist = schedule.playlist;
    } else {
      const fallback = await getDefaultPlaylist(channelId);

      playlist = fallback?.defaultPlaylist;
    }

    if (!playlist) {
      console.log("❌ No playlist");

      return;
    }

    const mode = schedule ? "SCHEDULE" : "FALLBACK";

    await this.switcher.stop(channelId);

    let startIndex = 0;

    if (schedule) {
      const result = this.catchup.calculate(schedule, new Date());

      startIndex = result.itemIndex;

      this.startOffsets.set(channelId, result.offset);

      console.log("📺 Catchup", result);
    }

    this.queueMode.set(channelId, mode);

    this.playout.replace(channelId, playlist.items ?? [], mode, startIndex);

    const channel = await getChannelBroadcastInfo(channelId);

    if (channel?.streamKey) {
      await this.playNext(channelId, channel.streamKey);
    }
  }

  private monitorLive(channelId: number, streamKey: string) {
    const timer = setInterval(async () => {
      if (this.switcher.getMode(channelId) !== "LIVE") {
        clearInterval(timer);

        return;
      }

      const alive = await this.switcher.hasLivePublisher(channelId);

      if (!alive) {
        console.log("🔴 LIVE ENDED");

        clearInterval(timer);

        await this.switcher.stop(channelId);

        await this.playNext(channelId, streamKey);
      }
    }, 3000);
  }

  async stop(channelId: number) {
    await this.switcher.stop(channelId);

    this.playout.clear(channelId);

    this.startOffsets.delete(channelId);

    console.log("🛑 stopped", channelId);
  }

  isRunning(channelId: number) {
    return this.switcher.getMode(channelId) !== "STOPPED";
  }
}
