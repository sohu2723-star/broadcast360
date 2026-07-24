import { BroadcastService } from "./broadcast.service";

import { SwitchManager } from "@/managers/switch-manager";
import { PlayoutManager } from "@/managers/playout-manager";
import { FFmpegManager } from "@/streaming/ffmpeg";
import { LiveManager } from "@/managers/live-manager";


// ==========================
// SINGLETON SERVICES
// ==========================

const ffmpeg = new FFmpegManager();

const playout = new PlayoutManager(
  ffmpeg
);

const live = new LiveManager();


const switcher = new SwitchManager(
  ffmpeg,
  playout,
  live
);


// ==========================
// BROADCAST INSTANCE
// ==========================

export const broadcast =
  new BroadcastService(
    switcher,
    playout,
    live
  );