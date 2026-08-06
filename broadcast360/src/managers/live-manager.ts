import { FFmpegManager } from "@/streaming/ffmpeg";
import { ChildProcess } from "child_process";

export class LiveManager {
  constructor(private ffmpeg: FFmpegManager) { }

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


    /*
    ==========================
        NORMALIZE INPUT
    ==========================
    */

    let normalizedInput = inputUrl.trim();


    if (!normalizedInput.includes("/live/")) {

      const parsed = new URL(normalizedInput);

      const key = parsed.pathname
        .split("/")
        .filter(Boolean)
        .pop();


      if (!key) {
        throw new Error(
          `Invalid RTMP URL: ${inputUrl}`
        );
      }

      normalizedInput =
        `${parsed.protocol}//${parsed.host}/live/${key}`;
    }


    const output =
      `rtmp://127.0.0.1:1935/source/${streamKey}`;


    const args = [

      "-re",

      "-i",
      normalizedInput,


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
      input: normalizedInput,
      output,
    });


    return this.ffmpeg.start(
      channelId,
      "LIVE",
      args
    );
  }


  async stop(channelId: number) {

    await this.ffmpeg.stop(
      channelId,
      "LIVE"
    );

    console.log(
      "🛑 LIVE SOURCE STOP",
      channelId
    );
  }


  isRunning(channelId: number) {

    return this.ffmpeg.isRunning(
      channelId,
      "LIVE"
    );
  }
}