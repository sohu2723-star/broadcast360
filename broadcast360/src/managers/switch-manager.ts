import { ChildProcess } from "child_process";

import { FFmpegManager } from "@/streaming/ffmpeg";
import { PlayoutManager } from "./playout-manager";
import { LiveManager } from "./live-manager";
import { ResolvedPlaylistItem } from "@/types/playlist";

type BroadcastMode = "STOPPED" | "VOD" | "LIVE";

export class SwitchManager {
  private mode = new Map<number, BroadcastMode>();

  private current = new Map<number, ChildProcess>();

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
    channelId: number,
    items: ResolvedPlaylistItem[],
    streamKey: string,
    startIndex: number,
    offset: number,
    onFinished: () => Promise<void>,
  ) {
    console.log("🟢 SWITCH TO VOD", channelId);

    await this.playout.start(
      channelId,
      items,
      streamKey,
      startIndex,
      offset,
      onFinished,
    );

    this.mode.set(channelId, "VOD");

    console.log("✅ MODE VOD", channelId);
  }

  private async waitStream(streamKey: string): Promise<boolean> {
    for (let i = 0; i < 20; i++) {
      try {
        const res = await fetch(
          `http://127.0.0.1:9997/v3/paths/get/live/${streamKey}`,
        );

        if (res.ok) {
          console.log("✅ STREAM READY");

          return true;
        }
      } catch (error) {
        console.log("⏳ Waiting stream...");
      }

      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    return false;
  }

  async switchToLive(channelId: number, input: string, streamKey: string) {
    console.log("🔴 START LIVE INPUT", {
      channelId,
      input,
    });

    const process = await this.live.start(channelId, input, streamKey);

    this.mode.set(channelId, "LIVE");

    console.log("✅ LIVE MODE ACTIVE", channelId);

    return process;
  }

  /*
  ===========================
         PLAY LIVE
  ===========================
  */

  async startLIVE(channelId: number, input: string, streamKey: string) {
    console.log("🔴 SWITCH TO LIVE", channelId);

    await this.stopCurrent(channelId);

    const process = await this.live.start(channelId, input, streamKey);

    const ready = await this.waitStream(streamKey);

    if (!ready) {
      throw new Error("Live not ready");
    }

    this.mode.set(channelId, "LIVE");

    console.log("✅ MODE LIVE", channelId);

    return process;
  }

  /*
  ===========================
         STOP CURRENT
  ===========================
  */

  async stopCurrent(channelId: number): Promise<void> {
    const mode = this.mode.get(channelId);

    console.log("🛑 STOP CURRENT", {
      channelId,
      mode,
    });

    if (mode === "VOD") {
      await this.playout.stop(channelId);
    }

    if (mode === "LIVE") {
      await this.live.stop(channelId);
    }

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
    return this.ffmpeg.isRunning(channelId) || this.live.isRunning(channelId);
  }
}
