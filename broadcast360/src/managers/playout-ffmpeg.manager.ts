import { spawn, ChildProcess } from "child_process";

export class PlayoutFFmpegManager {
  private processes = new Map<number, ChildProcess>();

  private streamKeys = new Map<number, string>();

  async start(
    channelId: number,
    concatFile: string,
    streamKey: string,
    offset: number = 0,
  ) {
    this.streamKeys.set(channelId, streamKey);
    // stop old playout first
    await this.stop(channelId);

    const output = `rtmp://127.0.0.1:1935/live/${streamKey}`;

    const args = [
      "-re",

      "-f",
      "concat",

      "-safe",
      "0",

      "-i",
      concatFile,

      ...(offset > 0 ? ["-ss", String(offset)] : []),

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

      "-c:a",
      "aac",

      "-b:a",
      "128k",

      "-f",
      "flv",

      output,
    ];

    console.log("🚀 START PLAYOUT", args.join(" "));

    const ffmpeg = spawn("ffmpeg", args, {
      windowsHide: true,
    });

    this.processes.set(channelId, ffmpeg);

    ffmpeg.stderr.on("data", (data) => {
      console.log(`[PLAYOUT ${channelId}]`, data.toString());
    });

    ffmpeg.on("close", (code) => {
      console.log("🎬 PLAYOUT END", {
        channelId,
        code,
      });

      if (this.processes.get(channelId) === ffmpeg) {
        this.processes.delete(channelId);
      }
    });

    return ffmpeg;
  }

  async stop(channelId: number) {
    const ffmpeg = this.processes.get(channelId);

    if (!ffmpeg) {
      return;
    }

    console.log("🛑 STOP PLAYOUT", channelId);

    ffmpeg.kill("SIGTERM");

    this.processes.delete(channelId);
  }

  isRunning(channelId: number) {
    return this.processes.has(channelId);
  }
}
