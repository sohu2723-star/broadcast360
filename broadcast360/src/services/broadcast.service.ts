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

  async waitForStream(url: string, timeout = 10000) {
    const start = Date.now();

    while (Date.now() - start < timeout) {
      try {
        const response = await fetch(
          "http://127.0.0.1:9997/v3/paths/get/vod/11",
        );

        if (response.ok) {
          console.log("✅ SOURCE READY");
          return;
        }
      } catch {}

      await new Promise((r) => setTimeout(r, 500));
    }

    throw new Error("SOURCE TIMEOUT");
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
      console.log("🔄 SWITCH BROADCAST", {
        channelId,
        schedule: schedule?.id ?? "FALLBACK",
      });

      /*
=====================
 STOP OLD PIPELINE
=====================
*/

      await this.playout.stop(channelId);

      await this.switcher.stopCurrent(channelId);

      /*
=====================
 PLAYLIST
=====================
*/

      const playlist = await this.getPlaylist(schedule, channelId);

      if (!playlist) {
        console.log("❌ NO PLAYLIST");

        return;
      }

      /*
=====================
 CATCHUP
=====================
*/

      let startIndex = 0;

      let offset = 0;

      if (schedule) {
        const result = this.catchup.calculate(schedule, new Date());

        startIndex = result.itemIndex;

        offset = result.offset;

        console.log("⏱ CATCHUP", result);
      }

      /*
=====================
 RESOLVE
=====================
*/

      const items: ResolvedPlaylistItem[] = this.resolver.resolve(
        playlist.items ?? [],
      );

      if (items.length === 0) {
        console.log("⚠ EMPTY PLAYLIST");

        return;
      }

      const channel = await getChannelBroadcastInfo(channelId);

      if (!channel?.streamKey) {
        console.log("❌ NO STREAM KEY");

        return;
      }

      this.mode.set(channelId, schedule ? "SCHEDULE" : "FALLBACK");

      await this.session.start(channelId, schedule?.id ?? null);
      /*
      =====================
        FINISH CALLBACK
      =====================
      */

      const onFinished = async () => {
        console.log("📺 PLAYLIST FINISHED", {
          channelId,
          scheduleId: schedule?.id ?? null,
        });

        await this.playout.stop(channelId);

        await this.session.stop(channelId);

        /*
        notify scheduler
        */

        if (this.finishHandler) {
          await this.finishHandler({
            channelId,

            scheduleId: schedule?.id ?? null,
          });
        }
      };

      /*
      =====================
          LIVE ITEM
      =====================
      */

      const currentItem = items[startIndex];

      if (currentItem?.type === "STREAM") {
        console.log("🔴 LIVE PLAYLIST ITEM");

        await this.switcher.switchToLIVE(
          channelId,

          channel.streamKey,
        );

        return;
      }

      /*
      =====================
          START PLAYOUT
      =====================
      */

      await this.playout.start(
        channelId,

        items,

        channel.streamKey,

        startIndex,

        offset,

        onFinished,
      );

      await this.waitForStream(`vod/${channelId}`);

      /*
      =====================
          START VOD PATH
      =====================
      */

      /*
        Start switch first

        /vod/channelId
              |
              v
        /channel/streamKey
      */

      await this.switcher.switchToVOD(
        channelId,

        channel.streamKey,
      );

      /*
      wait a little for RTMP path
      */
    } finally {
      this.switching.delete(channelId);
    }
  }

  /*
=========================
      PLAYLIST
=========================
*/

  private async getPlaylist(
    schedule: ScheduleWithRelations | null,

    channelId: number,
  ) {
    if (schedule?.playlist) {
      console.log("📺 SCHEDULE PLAYLIST", schedule.playlist.name);

      return schedule.playlist;
    }

    const fallback = await getDefaultPlaylist(channelId);

    if (!fallback?.defaultPlaylist) {
      console.log("❌ NO FALLBACK PLAYLIST");

      return null;
    }

    console.log("🔁 FALLBACK PLAYLIST", fallback.defaultPlaylist.name);

    return fallback.defaultPlaylist;
  }

  /*
=========================
       STATUS
=========================
*/

  isLive(channelId: number) {
    return this.switcher.getMode(channelId) === "LIVE";
  }

  isRunning(channelId: number) {
    return this.switcher.isRunning(channelId);
  }

  getMode(channelId: number) {
    return this.mode.get(channelId) ?? null;
  }

  /*
=========================
          STOP
=========================
*/

  async stop(channelId: number) {
    await this.playout.stop(channelId);

    await this.switcher.stopCurrent(channelId);

    await this.session.stop(channelId);

    this.mode.delete(channelId);

    this.switching.delete(channelId);

    console.log("🛑 BROADCAST STOP", channelId);
  }
}
