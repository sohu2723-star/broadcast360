import { FFmpegManager } from "@/streaming/ffmpeg";
import { ChildProcess } from "child_process";

export class LiveManager {
  constructor(private ffmpeg: FFmpegManager) {}

  async start(
    channelId: number,
    inputUrl: string,
    streamKey: string,
  ): Promise<ChildProcess> {
    const existing = this.ffmpeg.get(channelId, "LIVE");

    if (existing) {
      console.log("⚠ LIVE already running", channelId);

      return existing;
    }

    const output = `rtmp://127.0.0.1:1935/live/${streamKey}`;

    const args = [
      "-i",
      inputUrl,

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

      "-f",
      "flv",

      output,
    ];

    console.log("🔴 START LIVE SOURCE", {
      channelId,
      inputUrl,
      output,
    });

    return this.ffmpeg.start(channelId, "LIVE", args);
  }

  async stop(channelId: number) {
    await this.ffmpeg.stop(channelId, "LIVE");

    console.log("🛑 LIVE SOURCE STOP", channelId);
  }

  isRunning(channelId: number) {
    return this.ffmpeg.isRunning(channelId, "LIVE");
  }
}
