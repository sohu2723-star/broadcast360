import {
  getDefaultPlaylist,
  getChannelBroadcastInfo,
} from "@/repositories/channel.repository";

import { ScheduleWithRelations } from "@/types/schedule.types";

import { PlaylistItemWithRelations } from "@/types/playlist";

import { PlaylistResolverService } from "@/services/playlist-resolver.service";

import { PlayoutQueueManager } from "@/managers/playout-queue.manager";

import { SwitchManager } from "@/managers/switch-manager";

import { ScheduleCatchupService } from "@/services/schedule-catchup.service";
import { ConcatBuilderService } from "@/services/concat-builder.service";
import { PlayoutManager } from "@/managers/playout-manager";

import path from "path";

export class BroadcastService {
  private switcher = new SwitchManager();

  private playout = new PlayoutQueueManager();

  // private resolver = new PlaylistResolverService();

  private catchup = new ScheduleCatchupService();

  private playing = new Map<number, boolean>();

  private startOffsets = new Map<number, number>();

  private liveMonitors = new Map<number, NodeJS.Timeout>();

  private liveEndHandler: ((channelId: number) => Promise<void>) | null = null;

  private concatBuilder = new ConcatBuilderService();

  // private playoutFFmpeg = new PlayoutFFmpegManager();
  private playoutFFmpeg = new PlayoutManager();

  /*
  ===============================
      CALLBACK
  ===============================
  */

  setLiveEndHandler(callback: (channelId: number) => Promise<void>) {
    this.liveEndHandler = callback;
  }

  isLive(channelId: number) {
    return this.switcher.isLIVE(channelId);
  }

  /*
  ===============================
          START
  ===============================
  */

  async start(schedule: ScheduleWithRelations | null, channelId: number) {
    await this.switchBroadcast(schedule, channelId);
  }

  /*
  ===============================
       GET PLAYLIST
  ===============================
  */

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

  /*
===============================
       PLAY NEXT
===============================
*/

  private async playNext(channelId: number, streamKey: string): Promise<void> {
    if (this.playing.get(channelId)) {
      return;
    }

    this.playing.set(channelId, true);

    try {
      const item = this.playout.next(channelId);

      if (!item) {
        console.log("📺 Queue finished");

        this.playing.set(channelId, false);

        return;
      }

      console.log("▶ PLAY", {
        id: item.id,
        type: item.type,
      });

      /*
    ======================
          LIVE
    ======================
    */

      if (item.type === "STREAM") {
        if (!item.stream) {
          this.playout.complete(channelId);

          this.playing.set(channelId, false);

          return this.playNext(channelId, streamKey);
        }

        await this.switcher.startLIVE(channelId, item.stream.url);

        console.log("🔴 LIVE started");

        this.monitorLive(channelId);

        this.playing.set(channelId, false);

        return;
      }

      /*
    ======================
          VOD
          
    No FFmpeg here anymore.
    Concat handles VOD.
    ======================
    */

      console.log("🎬 VOD handled by concat playout");

      this.playing.set(channelId, false);
    } catch (error) {
      console.error("❌ playNext error", error);

      this.playing.set(channelId, false);
    }
  }

  /*
===============================
       LIVE MONITOR
===============================
*/

  private monitorLive(channelId: number) {
    if (this.liveMonitors.has(channelId)) {
      return;
    }

    console.log("👀 Start live monitor", channelId);

    const timer = setInterval(async () => {
      if (!this.switcher.isLIVE(channelId)) {
        clearInterval(timer);

        this.liveMonitors.delete(channelId);

        return;
      }

      const alive = await this.switcher.hasLivePublisher(channelId);

      console.log("🔴 LIVE CHECK", {
        channelId,
        alive,
      });

      if (!alive) {
        console.log("🔴 LIVE ENDED", channelId);

        clearInterval(timer);

        this.liveMonitors.delete(channelId);

        // Stop LIVE mode
        await this.switcher.stopLIVEOnly(channelId);

        // Mark STREAM item finished
        this.playout.complete(channelId);

        const mode = this.playout.getMode(channelId);

        console.log("📺 LIVE finished", {
          channelId,
          mode,
        });

        if (mode === "FALLBACK") {
          console.log("📺 LIVE ended, scheduler decides next", channelId);

          if (this.liveEndHandler) {
            await this.liveEndHandler(channelId);
          }
        }

        /*
  Notify scheduler

  Scheduler will call:
  checkNow()
      |
      |
  findLiveSchedule()
      |
      |
  switchBroadcast()
      |
      |
  startPlaylistPlayout()
  */
      }
    }, 5000);

    this.liveMonitors.set(channelId, timer);
  }

  /*
  ===============================
       SWITCH BROADCAST
  ===============================
  */

  async switchBroadcast(
    schedule: ScheduleWithRelations | null,
    channelId: number,
  ) {
    /*
       LIVE protection
    */

    if (this.switcher.isLIVE(channelId)) {
      console.log("🔴 LIVE active");

      return;
    }

    const playlist = await this.getPlaylist(schedule, channelId);

    if (!playlist) {
      return;
    }

    // await this.switcher.stopVOD(channelId);
    await this.playoutFFmpeg.stop(channelId);

    let startIndex = 0;

    if (schedule) {
      const result = this.catchup.calculate(schedule, new Date());

      startIndex = result.itemIndex;

      this.startOffsets.set(channelId, result.offset);
    }

    this.playout.replace(
      channelId,
      playlist.items ?? [],
      schedule ? "SCHEDULE" : "FALLBACK",
      startIndex,
    );

    const channel = await getChannelBroadcastInfo(channelId);

    if (channel?.streamKey) {
      await this.startPlaylistPlayout(
        channelId,
        channel.streamKey,
        playlist.items ?? [],
        this.startOffsets.get(channelId) ?? 0,
        schedule ? "SCHEDULE" : "FALLBACK",
      );
      this.startOffsets.delete(channelId);
    }
  }

  private async startPlaylistPlayout(
    channelId: number,
    streamKey: string,
    items: PlaylistItemWithRelations[],
    offset: number = 0,
    mode: "SCHEDULE" | "FALLBACK",
  ) {
    try {
      console.log("📄 Building concat playlist...", {
        channelId,
        totalItems: items.length,
      });

      const concatFile = await this.concatBuilder.build(channelId, items);

      console.log("🚀 Starting FFmpeg playout", concatFile);

      await this.playoutFFmpeg.start(channelId, concatFile, streamKey, offset, mode === "FALLBACK",);

      console.log("✅ Playlist playout running", channelId);
    } catch (error) {
      console.error("❌ Playlist playout failed", error);
    }
  }

  /*
  ===============================
        STOP
  ===============================
  */

  async stop(channelId: number) {
    const timer = this.liveMonitors.get(channelId);

    if (timer) {
      clearInterval(timer);
      this.liveMonitors.delete(channelId);
    }

    await this.playoutFFmpeg.stop(channelId);

    await this.switcher.stop(channelId);

    this.playout.clear(channelId);

    this.playing.delete(channelId);

    this.startOffsets.delete(channelId);
  }

  isRunning(channelId: number) {
    return (
      this.playoutFFmpeg.isRunning(channelId) || this.switcher.isLIVE(channelId)
    );
  }
}
