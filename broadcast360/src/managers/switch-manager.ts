import { ChildProcess } from "child_process";

import { FFmpegManager } from "@/streaming/ffmpeg";
import { PlayoutManager } from "./playout-manager";
import { LiveManager } from "./live-manager";

type BroadcastMode =
  | "STOPPED"
  | "VOD"
  | "LIVE";

export class SwitchManager {

  private mode =
    new Map<number, BroadcastMode>();

  private current =
    new Map<number, ChildProcess>();

  constructor(
    private ffmpeg: FFmpegManager,
    private playout: PlayoutManager,
    private live: LiveManager,
  ) {}

  /*
  ===========================
        PLAY VOD
  ===========================
  */

  async startVOD(
    channelId:number,
    file:string,
    streamKey:string,
    offset:number = 0,
  ): Promise<ChildProcess>{

    await this.stopCurrent(channelId);

    const args = [

      "-re",

      ...(offset > 0
        ? ["-ss", String(offset)]
        : []),

      "-i",
      file,

      "-c:v","libx264",
      "-preset","veryfast",
      "-tune","zerolatency",

      "-pix_fmt","yuv420p",

      "-r","30",

      "-g","60",

      "-c:a","aac",

      "-ar","48000",

      "-b:a","128k",

      "-f","flv",

      `rtmp://127.0.0.1:1935/live/${streamKey}`

    ];

    const process =
      this.ffmpeg.start(
        channelId,
        args
      );

    this.current.set(
      channelId,
      process
    );

    this.mode.set(
      channelId,
      "VOD"
    );

    return process;
  }

  /*
  ===========================
         PLAY LIVE
  ===========================
  */

  async startLIVE(
    channelId:number,
    input:string,
    streamKey:string,
  ): Promise<ChildProcess>{

    await this.stopCurrent(channelId);

    const process =
      await this.live.start(
        channelId,
        input,
        streamKey
      );

    this.current.set(
      channelId,
      process
    );

    this.mode.set(
      channelId,
      "LIVE"
    );

    return process;
  }

  /*
  ===========================
         STOP CURRENT
  ===========================
  */

  async stopCurrent(
    channelId:number,
  ): Promise<void>{

    await this.ffmpeg.stop(channelId);

    this.current.delete(channelId);

    this.mode.set(
      channelId,
      "STOPPED"
    );
  }

  /*
  ===========================
         STATUS
  ===========================
  */

  getMode(
    channelId:number,
  ): BroadcastMode{

    return (
      this.mode.get(channelId)
      ?? "STOPPED"
    );
  }

  isRunning(
    channelId:number,
  ): boolean{

    return this.ffmpeg.isRunning(channelId);
  }
}