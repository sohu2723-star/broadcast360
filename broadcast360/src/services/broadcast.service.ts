import {
  getDefaultPlaylist,
  getChannelBroadcastInfo,
} from "@/repositories/channel.repository";

import { ScheduleWithRelations } from "@/types/schedule.types";
import { ResolvedPlaylistItem } from "@/types/playlist";

import { PlaylistResolverService } from "@/services/playlist-resolver.service";
import { ScheduleCatchupService } from "@/services/schedule-catchup.service";

import { SwitchManager } from "@/managers/switch-manager";
import { PlayoutManager } from "@/managers/playout-manager";
import { SessionManager } from "@/managers/session-manager";
import { LiveManager } from "@/managers/live-manager";
import { MediaMTXManager } from "@/managers/mediamtx.manager";
import { RecordingManager } from "@/managers/recording-manager";
import { RecordingService } from "./recording.service";

type BroadcastMode = "SCHEDULE" | "FALLBACK";

export class BroadcastService {
  private resolver = new PlaylistResolverService();

  private catchup = new ScheduleCatchupService();

  private session = new SessionManager();

  private mode = new Map<number, BroadcastMode>();

  private switching = new Map<number, boolean>();

  private finishHandler:
    | ((data: {
        channelId: number;
        scheduleId: number | null;
      }) => Promise<void>)
    | null = null;

  constructor(
    private switcher: SwitchManager,

    private playout: PlayoutManager,

    private live: LiveManager,

    private mediaMTX: MediaMTXManager,

    private recordingService: RecordingService
  ) {}

  setPlaylistFinishedHandler(
    callback: (data: {
      channelId: number;
      scheduleId: number | null;
    }) => Promise<void>,
  ) {
    this.finishHandler = callback;
  }

  async start(schedule: ScheduleWithRelations | null, channelId: number) {
    await this.switchBroadcast(schedule, channelId);
  }

  async switchBroadcast(
    schedule: ScheduleWithRelations | null,

    channelId: number,
  ) {
    if (this.switching.get(channelId)) {
      console.log("⏳ SWITCH LOCK", channelId);

      return;
    }

    this.switching.set(channelId, true);

    try {
      console.log("🔄 BROADCAST SWITCH", {
        channelId,
        schedule: schedule?.id ?? "FALLBACK",
      });

      /*
      =========================
          STOP CURRENT
      =========================
      */

      await this.recordingService.stop(channelId);

      await this.playout.stop(channelId);

      await this.live.stop(channelId);

      await this.switcher.stopCurrent(channelId);

      /*
      =========================
          GET PLAYLIST
      =========================
      */

      const playlist = await this.getPlaylist(schedule, channelId);

      if (!playlist) {
        console.log("❌ NO PLAYLIST");

        return;
      }

      /*
      =========================
          RESOLVE FIRST
      =========================
      */

      const items: ResolvedPlaylistItem[] = this.resolver.resolve(
        playlist.items ?? [],
      );

      console.log(
        "📃 RESOLVED ITEMS",
        items.map((i) => ({
          id: i.id,
          type: i.type,
          url: i.streamUrl ?? i.videoUrl,
        })),
      );

      if (items.length === 0) {
        console.log("⚠ EMPTY PLAYLIST");

        return;
      }

      /*
      =========================
          CATCHUP
      =========================
      */

      let startIndex = 0;

      let offset = 0;

      if (schedule) {
        const result = this.catchup.calculate(
          items,

          new Date(schedule.startTime),

          new Date(),
        );

        startIndex = result.itemIndex;

        offset = result.offset;

        console.log("⏱ CATCHUP", {
          startIndex,
          offset,
          current: items[startIndex],
        });
      }

      const channel = await getChannelBroadcastInfo(channelId);

      if (!channel?.streamKey) {
        console.log("❌ NO STREAM KEY");

        return;
      }

      await this.session.start(
        channelId,

        schedule?.id ?? null,
      );

      this.mode.set(channelId, schedule ? "SCHEDULE" : "FALLBACK");

      /*
      =========================
             CURRENT ITEM
      =========================
      */

      const current = items[startIndex];

      console.log("🎯 CURRENT ITEM", current);

      /*
      =========================
              LIVE
      =========================
      */

      if (current?.type === "STREAM") {
        if (!current.streamUrl) {
          throw new Error("STREAM URL MISSING");
        }

        console.log("🔴 START LIVE", current.streamUrl);

        await this.live.start(
          channelId,

          current.streamUrl,

          channel.streamKey,
        );

        await this.mediaMTX.waitPublisher(`live/${channel.streamKey}`);

        // =========================
        // START RECORDING HERE
        // =========================

        await this.switcher.switchToLIVE(
          channelId,

          channel.streamKey,
        );

        
          await this.recordingService.start(
          channelId,
          channel.streamKey,
          current.title ?? "Live News",
        );

        await this.session.live(channelId);

        return;
      }

      /*
      =========================
              VOD
      =========================
      */

      const playItems = items
        .slice(startIndex)
        .filter((item) => item.type !== "STREAM");

      if (playItems.length === 0) {
        console.log("⚠ NO VOD AFTER CURRENT ITEM");

        return;
      }

      const onFinished = async () => {
        console.log("📺 PLAYLIST FINISHED", channelId);

        await this.session.stop(channelId);

        if (this.finishHandler) {
          await this.finishHandler({
            channelId,

            scheduleId: schedule?.id ?? null,
          });
        }
      };

      const isFallback = schedule === null;
      await this.playout.start(
        channelId,

        playItems,

        offset,

        onFinished,

        isFallback,
      );

      await this.mediaMTX.waitPublisher(`vod/${channelId}`);

      await this.switcher.switchToVOD(
        channelId,

        channel.streamKey,
      );

      await this.session.live(channelId);
    } catch (error) {
      console.error("❌ BROADCAST ERROR", error);

      await this.session.error(
        channelId,

        String(error),
      );

      throw error;
    } finally {
      this.switching.delete(channelId);
    }
  }

  private async getPlaylist(
    schedule: ScheduleWithRelations | null,

    channelId: number,
  ) {
    if (schedule?.playlist) {
      return schedule.playlist;
    }

    const fallback = await getDefaultPlaylist(channelId);

    return fallback?.defaultPlaylist ?? null;
  }

  isLive(channelId: number) {
    return this.switcher.getMode(channelId) === "LIVE";
  }

  isRunning(channelId: number) {
    return this.switcher.isRunning(channelId);
  }

  async stop(channelId: number) {
    await this.recordingService.stop(channelId);

    await this.playout.stop(channelId);

    await this.live.stop(channelId);

    await this.switcher.stopCurrent(channelId);

    await this.session.stop(channelId);

    this.mode.delete(channelId);

    this.switching.delete(channelId);

    console.log("🛑 BROADCAST STOP", channelId);
  }
}
