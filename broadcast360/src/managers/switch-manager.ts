import { ChildProcess } from "child_process";

import { FFmpegManager } from "@/streaming/ffmpeg";
import { PlayoutManager } from "./playout-manager";
import { LiveManager } from "./live-manager";
import { PreloadManager } from "./preload-manager";

type BroadcastMode = "STOPPED" | "VOD" | "LIVE";

export class SwitchManager {
  private mode = new Map<number, BroadcastMode>();

  private current = new Map<number, ChildProcess>();

  constructor(
    private ffmpeg: FFmpegManager,
    private playout: PlayoutManager,
    private live: LiveManager,
    private preload: PreloadManager,
  ) {}

  /*
===========================
      CHECK PRELOAD
===========================
*/

  getPreloaded(channelId: number) {
    const data = this.preload.get(channelId);

    if (!data) {
      console.log("📦 NO PRELOAD", channelId);

      return null;
    }

    console.log("📦 PRELOAD READY", {
      channelId,
      item: data.item.id,
    });

    return data;
  }

  /*
  ===========================
        PLAY VOD
  ===========================
  */

  // async startVOD(
  //   channelId:number,
  //   file:string,
  //   streamKey:string,
  //   offset:number = 0,
  // ): Promise<ChildProcess>{

  //   await this.stopCurrent(channelId);

  //   const args = [

  //     "-re",

  //     ...(offset > 0
  //       ? ["-ss", String(offset)]
  //       : []),

  //     "-i",
  //     file,

  //     "-c:v","libx264",
  //     "-preset","veryfast",
  //     "-tune","zerolatency",

  //     "-pix_fmt","yuv420p",

  //     "-r","30",

  //     "-g","60",

  //     "-c:a","aac",

  //     "-ar","48000",

  //     "-b:a","128k",

  //     "-f","flv",

  //     `rtmp://127.0.0.1:1935/live/${streamKey}`

  //   ];

  //   const process =
  //     this.ffmpeg.start(
  //       channelId,
  //       args
  //     );

  //   this.current.set(
  //     channelId,
  //     process
  //   );

  //   this.mode.set(
  //     channelId,
  //     "VOD"
  //   );

  //   return process;
  // }

  /*
  ===========================
         PLAY LIVE
  ===========================
  */

  async startLIVE(
    channelId: number,
    input: string,
    streamKey: string,
  ): Promise<ChildProcess> {
    await this.stopCurrent(channelId);

    const process = await this.live.start(channelId, input, streamKey);

    this.current.set(channelId, process);

    this.mode.set(channelId, "LIVE");

    return process;
  }

  // switch to preload
  async switchToPreload(channelId: number) {
    const preload = this.preload.get(channelId);

    if (!preload) {
      console.log("NO PRELOAD");
      return;
    }

    console.log("🔄 SWITCH TO PRELOAD", preload.item.id);

    // stop current
    await this.ffmpeg.stop(channelId, "SOURCE");

    // later:
    // rename preload stream
    // or use MediaMTX path switch
  }

  /*
  ===========================
         STOP CURRENT
  ===========================
  */

  async stopCurrent(channelId: number): Promise<void> {
    await this.ffmpeg.stop(channelId, "ROUTER");

    this.current.delete(channelId);

    this.mode.set(channelId, "STOPPED");
  }

  /*
  ===========================
         STATUS
  ===========================
  */

  getMode(channelId: number): BroadcastMode {
    return this.mode.get(channelId) ?? "STOPPED";
  }

  isRunning(channelId: number): boolean {
    return this.ffmpeg.isRunning(channelId);
  }

  async switchToVOD(
  channelId: number,
  streamKey: string
): Promise<void> {

  const input =
    `rtmp://127.0.0.1:1935/vod/${channelId}`;

  const output =
    `rtmp://127.0.0.1:1935/channel/${streamKey}`;


  const args = [
    "-re",

    "-fflags",
    "+genpts",

    "-i",
    input,

    "-c",
    "copy",

    "-f",
    "flv",

    output,
  ];


  console.log("🎬 SWITCH TO VOD", {
    input,
    output,
  });


  // start only if router does not exist
  if (!this.ffmpeg.has(channelId, "ROUTER")) {
    const process = this.ffmpeg.start(
      channelId,
      "ROUTER",
      args
    );

    this.current.set(channelId, process);
  }


  this.mode.set(channelId, "VOD");
}

  async switchToLIVE(channelId: number, streamKey: string) {
    await this.stopCurrent(channelId);

    const input = `rtmp://127.0.0.1:1935/camera/${channelId}`;

    const output = `rtmp://127.0.0.1:1935/channel/${streamKey}`;

    const args = [
      "-re",

      "-i",
      input,

      "-c:v",
      "copy",

      "-c:a",
      "aac",

      "-f",
      "flv",

      output,
    ];

    const process = this.ffmpeg.start(channelId, "ROUTER", args);

    this.current.set(channelId, process);

    this.mode.set(channelId, "LIVE");
  }
}
