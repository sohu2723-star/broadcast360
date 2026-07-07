import { spawn } from "child_process";
import path from "path";
import fs from "fs";

export class FFmpegManager {
  // ✔ FIX: correct type for spawned process
  private processes: Map<number, ReturnType<typeof spawn>> = new Map();

  start(
    channelId: number,
    inputs: string[],
    outputDir: string
  ): ReturnType<typeof spawn> | null {
    if (!inputs || inputs.length === 0) {
      console.log("❌ No input for FFmpeg");
      return null;
    }

    const resolveInputPath = (videoUrl: string) => {
      if (videoUrl.startsWith("/")) {
        return path.join(process.cwd(), "public", videoUrl);
      }
      return videoUrl;
    };

    const input = resolveInputPath(inputs[0]);

    // ✔ FIX: validate file exists
    if (!fs.existsSync(input)) {
      console.log("❌ File not found:", input);
      return null;
    }

    // ✔ create output folder
    const fullPath = path.resolve(
      process.cwd(),
      "public",
      "streams",
      `channel-${channelId}`
    );

    if (fs.existsSync(fullPath)) {
    fs.rmSync(fullPath, {
      recursive: true,
      force: true,
    });
  }

  fs.mkdirSync(fullPath, {
    recursive: true,
  });

    const outputPath = path.join(fullPath, "index.m3u8");

    console.log("📡 FFmpeg input:", input);
    console.log("📁 Output:", outputPath);

    const ffmpegArgs = [
      "-re",
      "-i",
      input,

      // video
      "-c:v",
      "libx264",
      "-preset",
      "veryfast",
      "-tune",
      "zerolatency",

      // audio
      "-c:a",
      "aac",
      "-b:a",
      "128k",

      // HLS settings
      "-f",
      "hls",
      "-hls_time",
      "4",
      "-hls_list_size",
      "6",
      "-hls_flags",
      "delete_segments",
      "-hls_allow_cache",
      "1",

      outputPath,
    ];

    const ffmpeg = spawn("ffmpeg", ffmpegArgs, {
      stdio: ["ignore", "pipe", "pipe"],
    });

    // ✔ store process safely
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