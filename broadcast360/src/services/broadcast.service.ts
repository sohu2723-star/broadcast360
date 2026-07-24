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

type BroadcastMode = "SCHEDULE" | "FALLBACK";

export class BroadcastService {
  private resolver = new PlaylistResolverService();

  private catchup = new ScheduleCatchupService();

  private session = new SessionManager();

  private mode = new Map<number, BroadcastMode>();

  private finishHandler: ((channelId: number) => Promise<void>) | null = null;

  private liveEndHandler: ((channelId: number) => Promise<void>) | null = null;

  constructor(
    private switcher: SwitchManager,

    private playout: PlayoutManager,
  ) {}

  /*
  =====================================
        CALLBACK
  =====================================
  */

  /*
=====================================
      CALLBACK
=====================================
*/

  setPlaylistFinishedHandler(callback: (channelId: number) => Promise<void>) {
    this.finishHandler = callback;
  }

  setLiveEndHandler(callback: (channelId: number) => Promise<void>) {
    this.liveEndHandler = callback;
  }

  /*
  =====================================
        START
  =====================================
  */

  async start(schedule: ScheduleWithRelations | null, channelId: number) {
    await this.switchBroadcast(schedule, channelId);
  }

  /*
  =====================================
       MAIN SWITCH
  =====================================
  */

  async switchBroadcast(
    schedule: ScheduleWithRelations | null,

    channelId: number,
  ) {
    console.log("🔄 BROADCAST SWITCH", {
      channelId,
      schedule: schedule?.id ?? "FALLBACK",
    });

    const playlist = await this.getPlaylist(schedule, channelId);

    if (!playlist) {
      console.log("❌ No playlist");

      return;
    }

    let startIndex = 0;

    let offset = 0;

    /*
    ==========================
       WALL CLOCK CATCHUP
    ==========================
    */

    if (schedule) {
      const result = this.catchup.calculate(schedule, new Date());

      startIndex = result.itemIndex;

      offset = result.offset;

      console.log("⏱ CATCHUP", result);
    }

    /*
    ==========================
       RESOLVE PLAYLIST
    ==========================
    */

    const items: ResolvedPlaylistItem[] = this.resolver.resolve(
      playlist.items ?? [],
    );

    if (items.length === 0) {
      console.log("⚠ Empty playlist");

      return;
    }

    /*
    ==========================
        MODE
    ==========================
    */

    this.mode.set(
      channelId,

      schedule ? "SCHEDULE" : "FALLBACK",
    );

    /*
    ==========================
        SESSION
    ==========================
    */

    await this.session.start(channelId, schedule?.id ?? null);

    /*
    ==========================
        START PLAYOUT
    ==========================
    */

    const channel = await getChannelBroadcastInfo(channelId);

    if (!channel?.streamKey) {
      console.log("❌ Missing stream key");

      return;
    }

    await this.playout.start(
      channelId,

      items,

      channel.streamKey,

      startIndex,

      offset,

      async () => {
        console.log("📺 PLAYLIST FINISHED", channelId);

        await this.session.stop(channelId);

        if (this.liveEndHandler) {
          await this.liveEndHandler(channelId);
        }

        if (this.finishHandler) {
          await this.finishHandler(channelId);
        }
      },
    );
  }

  /*
  =====================================
        GET PLAYLIST
  =====================================
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
      console.log("❌ No fallback playlist");

      return null;
    }

    console.log("🔁 Fallback playlist", fallback.defaultPlaylist.name);

    return fallback.defaultPlaylist;
  }

  /*
  =====================================
       STATUS
  =====================================
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
  =====================================
        STOP
  =====================================
  */

  async stop(channelId: number) {
    await this.playout.stop(channelId);

    await this.switcher.stopCurrent(channelId);

    await this.session.stop(channelId);

    this.mode.delete(channelId);

    console.log("🛑 BROADCAST STOPPED", channelId);
  }
}
