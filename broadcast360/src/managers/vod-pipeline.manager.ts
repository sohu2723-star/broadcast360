import { spawn, ChildProcess } from "child_process";
import fs from "fs";

export class VODPipelineManager {
  private processes = new Map<number, ChildProcess>();

  start(
    channelId: number,
    videoFile: string,
    streamKey: string,
    startOffset: number = 0,
  ): ChildProcess | null {
    // Prevent duplicate VOD
    if (this.processes.has(channelId)) {
      console.log("⚠ VOD already running", channelId);
      return null;
    }

    // Check video exists
    if (!fs.existsSync(videoFile)) {
      console.log("❌ Video missing:", videoFile);
      return null;
    }

    const output = `rtmp://127.0.0.1:1935/live/${streamKey}`;

    console.log("==============================");
    console.log("🎬 VOD START");
    console.log("CHANNEL:", channelId);
    console.log("FILE:", videoFile);
    console.log("RTMP:", output);
    console.log("⏩ OFFSET:", startOffset, "seconds");
    console.log("==============================");

    const args: string[] = [];

    /**
     * Catch-up playback
     * Seek BEFORE opening the input.
     */
    if (startOffset > 0) {
      args.push("-ss", String(startOffset));
    }

    args.push(
      // Read input in realtime
      "-re",

      // Generate timestamps
      "-fflags",
      "+genpts",

      // Input
      "-i",
      videoFile,

      // Video
      "-c:v",
      "libx264",

      "-preset",
      "veryfast",

      "-tune",
      "zerolatency",

      "-pix_fmt",
      "yuv420p",

      // Audio
      "-c:a",
      "aac",

      "-ar",
      "48000",

      "-b:a",
      "128k",

      // Stable FPS
      "-vsync",
      "cfr",

      // RTMP output
      "-flvflags",
      "no_duration_filesize",

      "-f",
      "flv",

      output,
    );

    console.log("🚀 FFmpeg command:");
    console.log("ffmpeg", args.join(" "));

    const ffmpeg = spawn("ffmpeg", args, {
      stdio: ["ignore", "pipe", "pipe"],
    });

    this.processes.set(channelId, ffmpeg);

    // stdout
    ffmpeg.stdout.on("data", (data) => {
      console.log(`[VOD OUT ${channelId}]`, data.toString());
    });

    // stderr (FFmpeg logs)
    ffmpeg.stderr.on("data", (data) => {
      console.log(`[VOD ${channelId}]`, data.toString());
    });

    // Spawn error
    ffmpeg.on("error", (err) => {
      console.log("❌ FFmpeg spawn error", {
        channelId,
        err,
      });

      if (this.processes.get(channelId) === ffmpeg) {
        this.processes.delete(channelId);
      }
    });

    // Finished
    ffmpeg.on("close", (code, signal) => {
      console.log("🎬 VOD CLOSED", {
        channelId,
        code,
        signal,
      });

      if (this.processes.get(channelId) !== ffmpeg) {
        console.log("⚠ Old VOD ignored", channelId);
        return;
      }

      this.processes.delete(channelId);
    });

    return ffmpeg;
  }

  stop(channelId: number) {
    const process = this.processes.get(channelId);

    if (!process) {
      return;
    }

    console.log("🛑 Stop VOD", channelId);

    process.kill("SIGINT");

    this.processes.delete(channelId);
  }

  isRunning(channelId: number) {
    return this.processes.has(channelId);
  }
}
