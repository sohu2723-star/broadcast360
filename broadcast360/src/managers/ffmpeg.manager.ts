import { spawn, ChildProcessByStdio } from "child_process";

import { Readable, Writable } from "stream";
import path from "path";
import fs from "fs";

export class FFmpegManager {
  private processes = new Map<
    number,
    ChildProcessByStdio<null, Readable, Readable>
  >();

  /**
   * PLAY SINGLE VIDEO -> HLS
   */
  playSingle(channelId: number, videoFile: string, outputDir: string) {
    if (this.processes.has(channelId)) {
      console.log("⚠ FFmpeg already running:", channelId);

      return null;
    }

    if (!fs.existsSync(videoFile)) {
      console.log("❌ Video not found:", videoFile);

      return null;
    }

    const streamDir = path.resolve(
      process.cwd(),
      "public",
      "streams",
      `channel-${channelId}`,
    );

    fs.mkdirSync(streamDir, {
      recursive: true,
    });

    const output = path.join(streamDir, "index.m3u8");

    console.log("🎬 INPUT:", videoFile);

    console.log("📺 OUTPUT:", output);

    const args = [
      "-re",

      "-i",
      videoFile,

      "-vf",
      "scale=854:480,fps=30",

      "-c:v",
      "libx264",

      "-preset",
      "veryfast",

      "-tune",
      "zerolatency",

      "-c:a",
      "aac",

      "-ar",
      "48000",

      "-ac",
      "2",

      "-f",
      "hls",

      "-hls_time",
      "4",

      "-hls_list_size",
      "10",

      // IMPORTANT
      // allow playlist refresh
      "-hls_flags",
      "delete_segments+append_list+independent_segments",

      output,
    ];

    console.log("🚀 Starting FFmpeg");

    const ffmpeg = spawn("ffmpeg", args, {
      stdio: ["ignore", "pipe", "pipe"],
    });

    this.processes.set(channelId, ffmpeg);

    ffmpeg.stderr.on("data", (data) => {
      console.log(`[FFMPEG ${channelId}]`, data.toString());
    });

    ffmpeg.on("error", (error) => {
      console.log("❌ FFmpeg error", error);

      this.processes.delete(channelId);
    });

    ffmpeg.on("close", (code) => {
      console.log(`FFmpeg closed ${channelId}:`, code);

      this.processes.delete(channelId);
    });

    return ffmpeg;
  }

  stop(channelId: number) {
    const ffmpeg = this.processes.get(channelId);

    if (!ffmpeg) {
      console.log("⚠ No FFmpeg process");

      return;
    }

    ffmpeg.kill("SIGINT");

    this.processes.delete(channelId);

    console.log("🛑 FFmpeg stopped", channelId);
  }

  isRunning(channelId: number) {
    return this.processes.has(channelId);
  }
}
