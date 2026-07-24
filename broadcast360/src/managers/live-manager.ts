import { spawn, ChildProcess } from "child_process";

export class LiveManager {
  private processes = new Map<number, ChildProcess>();

  private stopping = new Set<number>();

  private onEnded: ((channelId: number) => Promise<void>) | null = null;

  setEndHandler(callback: (channelId: number) => Promise<void>) {
    this.onEnded = callback;
  }

  async start(
    channelId: number,
    inputUrl: string,
    streamKey: string,
  ): Promise<ChildProcess> {
    const existing = this.processes.get(channelId);

    if (existing) {
      console.log("⚠ LIVE ALREADY RUNNING", channelId);

      return existing;
    }

    /*
    =========================
       CHECK SOURCE FIRST
    =========================
    */

    const ready = await this.waitForStream(streamKey);

    if (!ready) {
      console.log("⏳ LIVE SOURCE NOT AVAILABLE", {
        channelId,
        streamKey,
      });

      throw new Error("LIVE SOURCE NOT AVAILABLE");
    }

    const output = `rtmp://127.0.0.1:1935/live/${streamKey}`;

    const args = [
      "-i",
      inputUrl,

      "-c:v",
      "libx264",

      "-preset",
      "veryfast",

      "-tune",
      "zerolatency",

      "-pix_fmt",
      "yuv420p",

      "-c:a",
      "aac",

      "-f",
      "flv",

      output,
    ];

    console.log("🔴 START LIVE FFMPEG", {
      channelId,
      inputUrl,
    });

    const ffmpeg = spawn("ffmpeg", args, {
      windowsHide: true,
    });

    this.processes.set(channelId, ffmpeg);

    ffmpeg.stderr.on("data", (data) => {
      console.log(`[LIVE ${channelId}]`, data.toString());
    });

    ffmpeg.on("close", async (code) => {
      console.log("🔴 LIVE PROCESS CLOSED", {
        channelId,
        code,
      });

      this.processes.delete(channelId);

      /*
        =====================
        MANUAL STOP
        =====================
        */

      if (this.stopping.has(channelId)) {
        this.stopping.delete(channelId);

        console.log("🛑 LIVE STOPPED MANUALLY", channelId);

        return;
      }

      /*
        =====================
        CRASH / OBS DISCONNECT
        =====================
        */

      console.log("⚠ LIVE LOST", channelId);

      if (this.onEnded) {
        await this.onEnded(channelId);
      }
    });

    return ffmpeg;
  }

  async stop(channelId: number) {
    const process = this.processes.get(channelId);

    if (!process) {
      return;
    }

    this.stopping.add(channelId);

    process.kill("SIGINT");

    this.processes.delete(channelId);
  }

  isRunning(channelId: number) {
    return this.processes.has(channelId);
  }

  private async waitForStream(streamKey: string) {
    for (let i = 0; i < 10; i++) {
      try {
        const res = await fetch(
          `http://127.0.0.1:9997/v3/paths/get/live/${streamKey}`,
        );

        if (res.ok) {
          const data = await res.json();

          if (data.source) {
            console.log("✅ LIVE SOURCE READY", streamKey);

            return true;
          }
        }
      } catch (error) {}

      await new Promise((r) => setTimeout(r, 1000));
    }

    return false;
  }
}
