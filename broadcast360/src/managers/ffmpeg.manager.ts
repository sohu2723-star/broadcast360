import { spawn, ChildProcessWithoutNullStreams } from "child_process";
import path from "path";
import fs from "fs";

export class FFmpegManager {
  private processes: Map<number, ChildProcessWithoutNullStreams> = new Map();

  start(channelId: number, inputs: string[], outputDir: string) {
    // ⚠️ MVP RULE: use only FIRST input first (no mixing yet)
  

    function resolveInputPath(videoUrl: string) {
  if (videoUrl.startsWith("/")) {
    return path.join(process.cwd(), "public", videoUrl);
  }

  return videoUrl;
}
    const input = resolveInputPath(inputs[0]);

    if (!input) {
      console.log("❌ No input for FFmpeg");
      return null;
    }

    // ensure folder exists
    const fullPath = path.resolve(process.cwd(), "public", "streams", `channel-${channelId}`);

    fs.mkdirSync(fullPath, { recursive: true });

    const outputPath = path.join(fullPath, "index.m3u8");

    console.log("📡 FFmpeg input:", input);
    console.log("📁 Output:", outputPath);

    const ffmpegArgs = [
      "-re",
      "-i",
      input,

      // video codec
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
      "delete_segments+append_list",

      outputPath,
    ];

    const ffmpeg = spawn("ffmpeg", ffmpegArgs);

    // IMPORTANT FIX: avoid your TypeScript error
    this.processes.set(channelId, ffmpeg);

    ffmpeg.stdout.on("data", (data) => {
      console.log(`[FFMPEG ${channelId}]`, data.toString());
    });

    ffmpeg.stderr.on("data", (data) => {
      console.log(`[FFMPEG ERROR ${channelId}]`, data.toString());
    });

    ffmpeg.on("close", (code) => {
      console.log(`❌ FFmpeg exited for channel ${channelId} code:`, code);
      this.processes.delete(channelId);
    });

    return ffmpeg.pid;
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