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

  /**
   * Next schedule prepared
   */
  private preloadCache = new Map<number, ScheduleWithRelations>();

  private resolver = new PlaylistResolverService();

  private catchup = new ScheduleCatchupService();

  private startOffsets = new Map<number, number>();

  private queueMode = new Map<number, "SCHEDULE" | "FALLBACK">();

  async start(schedule: ScheduleWithRelations | null, channelId: number) {
    const channel = await getChannelBroadcastInfo(channelId);

    if (!channel?.streamKey) {
      console.log("❌ Stream key missing");

      return;
    }

    const playlist = await this.getPlaylist(schedule, channelId);

    if (!playlist) {
      return;
    }

    const items = playlist.items ?? [];

    const mode = schedule ? "SCHEDULE" : "FALLBACK";

    this.queueMode.set(channelId, mode);

    this.playout.load(channelId, items, mode);

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

    if (!fallback?.defaultPlaylist) {
      console.log("⚠ No fallback playlist");

      return null;
    }

    console.log("🔁 Fallback playlist", fallback.defaultPlaylist.name);

    return fallback.defaultPlaylist;
  }

  private async playNext(channelId: number, streamKey: string): Promise<void> {
    const item = this.playout.next(channelId);

    if (!item) {
      const mode = this.queueMode.get(channelId);

      console.log("⚠ Queue finished", mode);

      return;
    }

    console.log("▶ Playing", item.type);

    //-------------------------
    // LIVE STREAM
    //-------------------------

    if (item.type === "STREAM") {
      if (!item.stream) {
        return this.playNext(channelId, streamKey);
      }

      await this.switcher.startLIVE(channelId, item.stream);

      this.monitorLive(channelId, streamKey);

      return;
    }

    //-------------------------
    // VOD
    //-------------------------

    const video = this.resolver.resolve(item);

    if (!video) {
      return this.playNext(channelId, streamKey);
    }

    const fullPath = path.join(process.cwd(), "public", video);

    // get catchup offset ONLY once

    const offset = this.startOffsets.get(channelId) ?? 0;

    // remove after first video

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
      console.log("🎬 VOD finished", code);

      if (code === 0) {
        await this.playNext(channelId, streamKey);
      }
    });
  }

  //---------------------------------
  // PRELOAD ONLY
  //---------------------------------

  async preloadSchedule(schedule: ScheduleWithRelations, channelId: number) {
    console.log("📦 Preload schedule", schedule.id);

    this.preloadCache.set(channelId, schedule);
  }

  getPreloadedSchedule(channelId: number) {
    return this.preloadCache.get(channelId);
  }

  clearPreloadedSchedule(channelId: number) {
    this.preloadCache.delete(channelId);
  }

  //---------------------------------
  // SWITCH QUEUE
  //---------------------------------

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

    const items = playlist.items ?? [];

    const mode = schedule ? "SCHEDULE" : "FALLBACK";

    console.log("🔄 Switching broadcast", mode);

    this.queueMode.set(channelId, mode);

    // stop current ffmpeg
    await this.switcher.stop(channelId);

    // replace queue
    let startIndex = 0;
    let offset = 0;

    if (schedule) {
      const catchup = this.catchup.calculate(schedule, new Date());

      startIndex = catchup.itemIndex;

      offset = catchup.offset;

      this.startOffsets.set(channelId, offset);

      console.log("📺 Catchup", {
        startIndex,
        offset,
      });
    }

    this.playout.load(channelId, items, mode, startIndex);

    const channel = await getChannelBroadcastInfo(channelId);

    if (!channel?.streamKey) {
      return;
    }

    // start first schedule item
    await this.playNext(channelId, channel.streamKey);

    console.log("✅ Broadcast switched");
  }

  private monitorLive(channelId: number, streamKey: string) {
    const timer = setInterval(async () => {
      const mode = this.switcher.getMode(channelId);

      if (mode !== "LIVE") {
        clearInterval(timer);

        return;
      }

      const alive = await this.switcher.hasLivePublisher(channelId);

      if (!alive) {
        console.log("🔴 LIVE ENDED");

        clearInterval(timer);

        await this.switcher.stop(channelId);

        // scheduler will decide next
        console.log("▶ Continue playlist after LIVE");

        await this.playNext(channelId, streamKey);
      }
    }, 3000);
  }

  async stop(channelId: number) {
    await this.switcher.stop(channelId);

    this.playout.clear(channelId);

    this.clearPreloadedSchedule(channelId);

    console.log("🛑 stopped", channelId);
  }

  isRunning(channelId: number) {
    return this.switcher.getMode(channelId) !== "STOPPED";
  }
}
