import { BroadcastService } from "./broadcast.service";

import { FFmpegManager } from "@/streaming/ffmpeg";
import { SwitchManager } from "@/managers/switch-manager";
import { LiveManager } from "@/managers/live-manager";
import { MediaMTXManager } from "@/managers/mediamtx.manager";
import { ConcatManager } from "@/managers/concat-manager";
import { PlayoutManager } from "@/managers/playout-manager";
import { RecordingManager } from "@/managers/recording-manager";
import { RecordingService } from "@/services/recording.service";


const ffmpeg = new FFmpegManager();

const mediaMTX = new MediaMTXManager();

const concat = new ConcatManager();

const live = new LiveManager(ffmpeg);

const playout = new PlayoutManager(
  ffmpeg,
  concat
);

const switchManager = new SwitchManager(
  ffmpeg
);


const recordingManager =
 new RecordingManager(
   ffmpeg
 );


const recordingService =
 new RecordingService(
   recordingManager
 );


export const broadcast =
 new BroadcastService(

   switchManager,

   playout,

   live,

   mediaMTX,

   recordingService

 );


export {
 ffmpeg,
 mediaMTX,
 concat,
 live,
 playout,
 switchManager,
 recordingManager,
 recordingService
};