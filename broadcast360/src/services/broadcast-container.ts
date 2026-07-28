import { BroadcastService } from "./broadcast.service";

import { FFmpegManager } from "@/streaming/ffmpeg";

import { SwitchManager } from "@/managers/switch-manager";
import { LiveManager } from "@/managers/live-manager";
import { MediaMTXManager } from "@/managers/mediamtx.manager";
import { ConcatManager } from "@/managers/concat-manager";
import { PlayoutManager } from "@/managers/playout-manager";

const ffmpeg = new FFmpegManager();

const mediaMTX = new MediaMTXManager();

const concat = new ConcatManager();

const live = new LiveManager(ffmpeg);

const playout = new PlayoutManager(ffmpeg, concat);

const switchManager = new SwitchManager(ffmpeg);

export const broadcast = new BroadcastService(
  switchManager,
  playout,
  live,
  mediaMTX,
);

export { ffmpeg, concat, live, playout, mediaMTX, switchManager };
