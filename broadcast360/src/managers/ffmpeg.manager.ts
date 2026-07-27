import { spawn, ChildProcess } from "child_process";

import fs from "fs";

export class FFmpegManager {
  private processes = new Map<number, ChildProcess>();

  /*
  ====================================================
  VOD PLAYBACK

  Movie / Episode / Advertisement

  File
    |
    v
  FFmpeg
    |
    v
  RTMP
    |
    v
  MediaMTX
  ====================================================
  */

  playMovie(
    channelId: number,
    videoFile: string,
    streamKey: string,
    offset: number = 0,
  ) {
    if (this.processes.has(channelId)) {
      console.log("⚠ FFmpeg already running", channelId);

      return null;
    }

    if (!fs.existsSync(videoFile)) {
      console.log("❌ Video not found", videoFile);

      return null;
    }

    const output = `rtmp://127.0.0.1:1935/live/${streamKey}`;

    console.log("🎬 VOD START", {
      channelId,
      videoFile,
      offset,
      output,
    });

    const args = [
      "-re",

      ...(offset > 0 ? ["-ss", String(offset)] : []),

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

      output,
    ];

    const ffmpeg = spawn("ffmpeg", args, {
      windowsHide: true,
    });

    this.attachProcess(channelId, ffmpeg, "VOD");

    return ffmpeg;
  }

  /*
  ====================================================
  LIVE CAMERA

  RTSP
    |
    v
  FFmpeg
    |
    v
  RTMP
    |
    v
  MediaMTX

  ====================================================
  */

  startLive(channelId: number, rtspUrl: string, streamKey: string) {
    if (this.processes.has(channelId)) {
      console.log("⚠ Live already running", channelId);

      return null;
    }

    const output = `rtmp://127.0.0.1:1935/live/${streamKey}`;

    console.log("🎥 LIVE START", {
      channelId,
      rtspUrl,
      output,
    });

    const args = [
      "-rtsp_transport",
      "tcp",

      "-i",
      rtspUrl,

      "-c:v",
      "copy",

      "-c:a",
      "aac",

      "-ar",
      "48000",

      "-f",
      "flv",

      output,
    ];

    const ffmpeg = spawn("ffmpeg", args, {
      windowsHide: true,
    });

    this.attachProcess(channelId, ffmpeg, "LIVE");

    return ffmpeg;
  }

  /*
  ====================================================
  PROCESS LOGGER
  ====================================================
  */

  private attachProcess(
    channelId: number,
    ffmpeg: ChildProcess,
    type: "VOD" | "LIVE",
  ) {
    this.processes.set(channelId, ffmpeg);

    ffmpeg.stdout?.on("data", (data) => {
      console.log(`[${type} ${channelId}]`, data.toString());
    });

    ffmpeg.stderr?.on("data", (data) => {
      console.log(`[${type} ${channelId}]`, data.toString());
    });

    ffmpeg.on("error", (error) => {
      console.error(`❌ ${type} FFmpeg error`, {
        channelId,
        error,
      });

      this.removeProcess(channelId, ffmpeg);
    });

    ffmpeg.on("close", (code) => {
      console.log(`🛑 ${type} stopped`, {
        channelId,
        code,
      });

      this.removeProcess(channelId, ffmpeg);
    });
  }

  /*
  ====================================================
  SAFE REMOVE

  Ignore old ffmpeg process
  ====================================================
  */

  private removeProcess(channelId: number, ffmpeg: ChildProcess) {
    const current = this.processes.get(channelId);

    if (current !== ffmpeg) {
      console.log("⚠ Old FFmpeg ignored", channelId);

      return;
    }

    this.processes.delete(channelId);
  }

  /*
  ====================================================
  STOP
  ====================================================
  */

  stop(channelId: number) {
    const ffmpeg = this.processes.get(channelId);

    if (!ffmpeg) {
      return;
    }

    console.log("🛑 Stop FFmpeg", channelId);

    ffmpeg.kill("SIGINT");

    this.processes.delete(channelId);
  }

  /*
  ====================================================
  STOP AND WAIT
  ====================================================
  */

  async stopAndWait(channelId: number) {
    const ffmpeg = this.processes.get(channelId);

    if (!ffmpeg) {
      return;
    }

    console.log("Stopping FFmpeg", channelId);

    await new Promise<void>((resolve) => {
      ffmpeg.once("close", () => resolve());

      ffmpeg.kill("SIGINT");

      setTimeout(() => resolve(), 3000);
    });

    this.processes.delete(channelId);
  }

  /*
  ====================================================
  STATUS
  ====================================================
  */

  isRunning(channelId: number) {
    return this.processes.has(channelId);
  }

  getProcess(channelId: number) {
    return this.processes.get(channelId) ?? null;
  }
}
