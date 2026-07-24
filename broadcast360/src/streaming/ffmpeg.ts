import { spawn, ChildProcess } from "child_process";

export class FFmpegManager {
  private processes = new Map<number, ChildProcess>();

  start(channelId: number, args: string[]): ChildProcess {
    const existing = this.processes.get(channelId);

    if (existing) {
      console.log("⚠ FFmpeg already running", channelId);

      return existing;
    }

    console.log("🚀 START FFmpeg", {
      channelId,
      command: `ffmpeg ${args.join(" ")}`,
    });

    const ffmpeg = spawn("ffmpeg", args, {
      windowsHide: true,
    });

    this.processes.set(channelId, ffmpeg);

    ffmpeg.stderr.on("data", (data) => {
      console.log(`[FFMPEG ${channelId}]`, data.toString());
    });

    ffmpeg.on("error", (error) => {
      console.error("❌ FFmpeg error", {
        channelId,
        error,
      });

      this.remove(channelId, ffmpeg);
    });

    ffmpeg.on("close", (code) => {
      console.log("🛑 FFmpeg closed", {
        channelId,
        code,
      });

      this.remove(channelId, ffmpeg);
    });

    return ffmpeg;
  }

  async stop(channelId: number): Promise<void> {
    const ffmpeg = this.processes.get(channelId);

    if (!ffmpeg) {
      return;
    }

    console.log("🛑 STOP FFmpeg", channelId);

    ffmpeg.kill("SIGINT");

    this.processes.delete(channelId);
  }

  isRunning(channelId: number) {
    return this.processes.has(channelId);
  }

  get(channelId: number) {
    return this.processes.get(channelId) ?? null;
  }

  private remove(channelId: number, process: ChildProcess) {
    const current = this.processes.get(channelId);

    if (current !== process) {
      return;
    }

    this.processes.delete(channelId);
  }
}
