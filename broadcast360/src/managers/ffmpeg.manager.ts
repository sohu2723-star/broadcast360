import { spawn, ChildProcessByStdio } from "child_process";
import { Readable } from "stream";
import fs from "fs";

export class FFmpegManager {
  private processes = new Map<
    number,
    ChildProcessByStdio<null, Readable, Readable>
  >();

  /**
   * ====================================================
   * MOVIE / EPISODE / ADVERTISEMENT
   *
   * File
   *   ↓
   * FFmpeg
   *   ↓
   * RTMP
   *   ↓
   * MediaMTX
   * ====================================================
   */
  playMovie(channelId: number, videoFile: string, streamKey: string) {
    if (this.processes.has(channelId)) {
      console.log("⚠ Broadcast already running");

      return null;
    }

    if (!fs.existsSync(videoFile)) {
      console.log("❌ Video not found:", videoFile);

      return null;
    }

    const output = `rtmp://127.0.0.1:1935/live/${streamKey}`;

    console.log("🎬 Movie:", videoFile);
    console.log("📡 Output:", output);

    const args = [
      "-re",

      "-i",
      videoFile,

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

      "-ar",
      "48000",

      "-ac",
      "2",

      "-b:a",
      "128k",

      "-f",
      "flv",

      output,
    ];

    const ffmpeg = spawn("ffmpeg", args, {
      stdio: ["ignore", "pipe", "pipe"],
    });

    this.processes.set(channelId, ffmpeg);

    ffmpeg.stderr.on("data", (data) => {
      console.log(`[MOVIE ${channelId}]`, data.toString());
    });

    ffmpeg.on("error", (err) => {
      console.log("❌ Movie FFmpeg Error", err);

      this.processes.delete(channelId);
    });

    ffmpeg.on("close", (code) => {
      const current = this.processes.get(channelId);

      // ignore old ffmpeg process
      if (current !== ffmpeg) {
        console.log("old ffmpeg ignored", channelId);
        return;
      }

      console.log(`🛑 Movie stopped (${channelId})`, code);

      this.processes.delete(channelId);
    });

    return ffmpeg;
  }

  /**
   * ====================================================
   * LIVE CAMERA
   *
   * RTSP
   *   ↓
   * FFmpeg
   *   ↓
   * RTMP
   *   ↓
   * MediaMTX
   * ====================================================
   */
  startLive(channelId: number, rtspUrl: string, streamKey: string) {
    if (this.processes.has(channelId)) {
      console.log("⚠ Live already running");

      return null;
    }

    const output = `rtmp://127.0.0.1:1935/live/${streamKey}`;

    console.log("🎥 RTSP:", rtspUrl);
    console.log("📡 Output:", output);

    const args = [
      "-rtsp_transport",
      "tcp",

      "-i",
      rtspUrl,

      "-c:v",
      "copy",

      "-c:a",
      "aac",

      "-f",
      "flv",

      output,
    ];

    const ffmpeg = spawn("ffmpeg", args, {
      stdio: ["ignore", "pipe", "pipe"],
    });

    this.processes.set(channelId, ffmpeg);

    ffmpeg.stderr.on("data", (data) => {
      console.log(`[LIVE ${channelId}]`, data.toString());
    });

    ffmpeg.on("error", (err) => {
      console.log("❌ Live FFmpeg Error", err);

      this.processes.delete(channelId);
    });

    ffmpeg.on("close", (code) => {
      const current = this.processes.get(channelId);

      // ignore old ffmpeg process
      if (current !== ffmpeg) {
        console.log("old ffmpeg ignored", channelId);
        return;
      }

      console.log(`🛑 Movie stopped (${channelId})`, code);

      this.processes.delete(channelId);
    });

    return ffmpeg;
  }

  /**
   * ====================================================
   * STOP CURRENT BROADCAST
   * ====================================================
   */
  stop(channelId: number) {
    const ffmpeg = this.processes.get(channelId);

    if (!ffmpeg) {
      return;
    }

    ffmpeg.kill("SIGINT");

    this.processes.delete(channelId);

    console.log("🛑 Broadcast stopped:", channelId);
  }

  /**
   * ====================================================
   * CHECK RUNNING
   * ====================================================
   */
  isRunning(channelId: number) {
    return this.processes.has(channelId);
  }

  async stopAndWait(channelId: number) {
    const ffmpeg = this.processes.get(channelId);

    if (!ffmpeg) {
      return;
    }

    console.log("Stopping current ffmpeg", channelId);

    ffmpeg.kill("SIGINT");

    await new Promise((resolve) => setTimeout(resolve, 500));

    this.processes.delete(channelId);
  }
}
