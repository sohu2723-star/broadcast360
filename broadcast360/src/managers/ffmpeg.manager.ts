import { spawn } from "child_process";
import path from "path";
import fs from "fs";

export class FFmpegManager {
  private processes: Map<number, ReturnType<typeof spawn>> = new Map();

  start(
    channelId: number,
    concatFile: string,
    outputDir: string,
  ): ReturnType<typeof spawn> | null {
    if (!fs.existsSync(concatFile)) {
      console.log("❌ Concat file not found:", concatFile);

      return null;
    }

    const fullPath = path.resolve(
      process.cwd(),
      "public",
      "streams",
      `channel-${channelId}`,
    );

    fs.mkdirSync(fullPath, {
      recursive: true,
    });

    const outputPath = path.join(fullPath, "index.m3u8");

    console.log("📄 FFmpeg concat:", concatFile);

    console.log("📁 Output:", outputPath);

    const ffmpegArgs = [
      "-re",

      // generate clean timestamps
      "-fflags",
      "+genpts",

      "-avoid_negative_ts",
      "make_zero",

      // concat input
      "-f",
      "concat",

      "-safe",
      "0",

      "-i",
      concatFile,

      // force same output format
      "-map_metadata",
      "-1",

      "-vf",
      // "scale=1280:720,fps=30",
      "scale=854:480,fps=30",

      // video
      "-c:v",
      "libx264",

      "-preset",
      // "veryfast",
      "ultrafast",

      "-tune",
      "zerolatency",

      // force constant frame rate
      "-vsync",
      "cfr",

      // audio
      "-c:a",
      "aac",

      "-ar",
      "48000",

      "-ac",
      "2",

      "-b:a",
      "128k",

      // HLS
      "-f",
      "hls",

      "-hls_time",
      "4",

      "-hls_list_size",
      "10",

      "-hls_segment_type",
      "mpegts",

      "-hls_flags",
      "delete_segments+append_list+omit_endlist",

      outputPath,
    ];

    const ffmpeg = spawn("ffmpeg", ffmpegArgs, {
      stdio: ["ignore", "pipe", "pipe"],
    });

    this.processes.set(channelId, ffmpeg);

    ffmpeg.stderr.on("data", (data) => {
      console.log(`[FFMPEG ${channelId}]`, data.toString());
    });

    ffmpeg.on("error", (err) => {
      console.log(`❌ FFmpeg error channel ${channelId}:`, err);
    });

    ffmpeg.on("close", (code) => {
      console.log(`❌ FFmpeg exited channel ${channelId} code: ${code}`);

      this.processes.delete(channelId);
    });

    return ffmpeg;
  }

  stop(channelId: number) {
    const process = this.processes.get(channelId);

    if (!process) {
      console.log("⚠ No FFmpeg process found");

      return;
    }

    process.kill("SIGINT");

    this.processes.delete(channelId);

    console.log(`🛑 FFmpeg stopped for channel ${channelId}`);
  }

  isRunning(channelId: number) {
    return this.processes.has(channelId);
  }
}
