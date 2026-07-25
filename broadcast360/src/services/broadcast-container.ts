import { BroadcastService } from "./broadcast.service";

import { FFmpegManager } from "@/streaming/ffmpeg";

import { SwitchManager } from "@/managers/switch-manager";
import { PlayoutManager } from "@/managers/playout-manager";
import { LiveManager } from "@/managers/live-manager";
import { PreloadManager } from "@/managers/preload-manager";

/*
=========================
 SINGLETON INSTANCES
=========================
*/

const ffmpeg = new FFmpegManager();

const preload = new PreloadManager();

const live = new LiveManager();

/*
=========================
 CREATE SWITCH LATER
=========================
*/

let switchManager: SwitchManager | null = null;

/*
=========================
 PLAYOUT
=========================
*/

const playout = new PlayoutManager(
  ffmpeg,

  async (channelId, url, streamKey) => {
    if (!switchManager) {
      console.log("⚠ SwitchManager not ready");

      return;
    }

    await switchManager.switchToLIVE(
      channelId,

      streamKey,
    );
  },
);

/*
=========================
 SWITCH MANAGER
=========================
*/

switchManager = new SwitchManager(
  ffmpeg,

  playout,

  live,

  preload,
);

/*
=========================
 BROADCAST SERVICE
=========================
*/

export const broadcast = new BroadcastService(
  switchManager,

  playout,

  live,
);

export { ffmpeg, playout, live, preload, switchManager };
