import { spawn, ChildProcess } from "child_process";
import fs from "fs";

export class VODPipelineManager {
  private processes = new Map<number, ChildProcess>();

  start(channelId: number, videoPath: string, streamKey: string, offset = 0) {
    // already running
    const old = this.processes.get(channelId);

    if (old) {
      console.log("⚠ VOD already running", channelId);

      return old;
    }

    if (!fs.existsSync(videoPath)) {
      console.log("❌ Video not found", videoPath);

      return null;
    }

    const rtmp = `rtmp://127.0.0.1:1935/live/${streamKey}`;

    const args: string[] = [];

    if (offset > 0) {
      args.push("-ss", String(offset));
    }

    args.push(
      "-re",

      "-i",
      videoPath,

      "-c:v",
      "libx264",

      "-preset",
      "veryfast",

      "-pix_fmt",
      "yuv420p",

      "-r",
      "30",

      "-g",
      "60",

      "-keyint_min",
      "60",

      "-sc_threshold",
      "0",

      "-c:a",
      "aac",

      "-ar",
      "48000",

      "-ac",
      "2",

      "-b:a",
      "128k",

      "-f",
      "flv",

      rtmp,
    );

    console.log("🚀 FFmpeg VOD", args.join(" "));

    const ffmpeg = spawn("ffmpeg", args);

    this.processes.set(channelId, ffmpeg);

    ffmpeg.stderr.on("data", (data) => {
      console.log(`[VOD ${channelId}]`, data.toString());
    });

    ffmpeg.on("close", (code) => {
      console.log("🎬 VOD finished", {
        channelId,
        code,
      });

      this.processes.delete(channelId);
    });

    return ffmpeg;
  }

  stop(channelId: number) {
    const ffmpeg = this.processes.get(channelId);

    if (!ffmpeg) return;

    console.log("🛑 Stop VOD", channelId);

    ffmpeg.kill("SIGINT");

    this.processes.delete(channelId);
  }

  isRunning(channelId: number) {
    return this.processes.has(channelId);
  }
}
