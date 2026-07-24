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
import { SessionManager } from "@/managers/session.manager";
import { LiveManager } from "@/managers/live-manager";
import { createConcatFile } from "@/streaming/concat-builder";
import path from "path";

type BroadcastMode = "SCHEDULE" | "FALLBACK";

export class BroadcastService {
  private resolver = new PlaylistResolverService();

  private catchup = new ScheduleCatchupService();

  private session = new SessionManager();

  private mode = new Map<number, BroadcastMode>();

  private finishHandler: ((channelId: number) => Promise<void>) | null = null;

  private endHandler: ((channelId: number) => Promise<void>) | null = null;

  constructor(
    private switcher: SwitchManager,
    private playout: PlayoutManager,
    private live: LiveManager,
  ) {
    this.live.setEndHandler(async (channelId) => {
      console.log("🔴 LIVE LOST CALLBACK", channelId);

      if (this.endHandler) {
        await this.endHandler(channelId);
      }
    });
  }

  /*
  =====================================
        CALLBACK
  =====================================
  */

  setPlaylistFinishedHandler(callback: (channelId: number) => Promise<void>) {
    this.finishHandler = callback;
  }

  setBroadcastEndHandler(callback: (channelId: number) => Promise<void>) {
    this.endHandler = callback;
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
  force = false,
) {
    if (
  this.switcher.isRunning(channelId)
  &&
  !force
) {
      console.log("⚠ CHANNEL ALREADY RUNNING", {
        channelId,
        mode: this.switcher.getMode(channelId),
      });

      return;
    }

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

    const hasStream = items.some((item) => item.type === "STREAM");

    if (hasStream) {
      console.log("🔴 LIVE PLAYLIST DETECTED");

      startIndex = 0;
      offset = 0;
    } else {
      const files = items
        .filter((item) => item.videoUrl)
        .map((item) => path.join(process.cwd(), "public", item.videoUrl!));

      const concatFile = createConcatFile(channelId, files);

      console.log("✅ CONCAT CREATED", concatFile);
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

    if (items.length === 1 && items[0].type === "STREAM") {
      await this.switcher.switchToLive(
        channelId,
        items[0].streamUrl!,
        channel.streamKey,
      );

      return;
    }

    await this.switcher.startVOD(
      channelId,
      items,
      channel.streamKey,
      startIndex,
      offset,
      async () => {
        console.log("📺 PLAYLIST FINISHED", channelId);

        await this.session.stop(channelId);

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

    console.log("🔎 FALLBACK DEBUG", {
      channelId,
      fallbackId: fallback?.id,
      defaultPlaylistId: fallback?.defaultPlaylistId,
      playlist: fallback?.defaultPlaylist?.name,
    });

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

  async recoverLive(channelId: number) {

  console.log(
    "🔄 RECOVER LIVE STATE",
    channelId
  );

  await this.switcher.stopCurrent(channelId);

}
}
