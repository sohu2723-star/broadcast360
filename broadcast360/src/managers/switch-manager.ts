import { ChildProcess } from "child_process";

import { VODPipelineManager } from "./vod-pipeline.manager";
import { LivePipelineManager } from "./live-pipeline.manager";

import { Stream } from "@/generated/prisma/client";

type BroadcastMode = "VOD" | "LIVE" | "STOPPED";

export class SwitchManager {
  private vod = new VODPipelineManager();

  private live = new LivePipelineManager();

  private modes = new Map<number, BroadcastMode>();

  private processes = new Map<number, ChildProcess>();

  /**
   * ==========================
   * START VOD
   * ==========================
   */
  /**
 * ==========================
 * START VOD
 * ==========================
 */
async startVOD(
  channelId: number,
  videoFile: string,
  streamKey: string,
  startOffset: number = 0
) {
  const current = this.getMode(channelId);

  if (current === "LIVE") {
    console.log("🔄 LIVE -> VOD");

    await this.stopLIVE(channelId);
  }


  const ffmpeg =
    this.vod.start(
      channelId,
      videoFile,
      streamKey,
      startOffset
    );


  if (!ffmpeg) {
    console.log("❌ VOD failed");

    return null;
  }


  this.processes.set(
    channelId,
    ffmpeg
  );


  this.modes.set(
    channelId,
    "VOD"
  );


  ffmpeg.once(
    "close",
    (code)=>{

      const current =
        this.processes.get(channelId);


      if(current !== ffmpeg){

        console.log(
          "⚠ Old VOD ignored"
        );

        return;
      }


      console.log(
        "🎬 VOD finished",
        channelId,
        code
      );


      this.processes.delete(channelId);


      if(
        this.modes.get(channelId)==="VOD"
      ){

        this.modes.set(
          channelId,
          "STOPPED"
        );

      }

    }
  );


  return ffmpeg;
}

  /**
   * ==========================
   * START LIVE
   * ==========================
   */
  async startLIVE(channelId: number, stream: Stream) {
    const current = this.getMode(channelId);

    if (current === "VOD") {
      console.log("🔄 VOD -> LIVE");

      await this.stopVOD(channelId);
    }

    const started = await this.live.start(channelId, stream);

    if (!started) {
      console.log("❌ LIVE failed");

      return false;
    }

    this.modes.set(channelId, "LIVE");

    console.log("🔴 LIVE started", channelId);

    return true;
  }

  /**
   * ==========================
   * STOP VOD ONLY
   * ==========================
   */
  private async stopVOD(channelId: number) {
    const process = this.processes.get(channelId);

    if (process) {
      console.log("🛑 Stop VOD", channelId);

      process.kill("SIGINT");

      this.processes.delete(channelId);
    }

    this.vod.stop(channelId);
  }

  /**
   * ==========================
   * STOP LIVE ONLY
   * ==========================
   */
  private async stopLIVE(channelId: number) {
    console.log("🛑 Stop LIVE", channelId);

    await this.live.stop(channelId);
  }

  /**
   * ==========================
   * STOP EVERYTHING
   * ==========================
   */
  async stop(channelId: number) {
    console.log("🛑 Stop broadcast", channelId);

    await this.stopVOD(channelId);

    await this.stopLIVE(channelId);

    this.modes.delete(channelId);
  }

  getMode(channelId: number) {
    return this.modes.get(channelId) ?? "STOPPED";
  }

  getLiveStream(channelId: number) {
    return this.live.getStream(channelId);
  }

  async hasLivePublisher(channelId: number) {
    return this.live.hasPublisher(channelId);
  }

  isRunning(channelId: number) {
    return this.getMode(channelId) !== "STOPPED";
  }
}
