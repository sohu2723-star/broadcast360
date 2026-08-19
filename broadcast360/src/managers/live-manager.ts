import { FFmpegManager } from "@/streaming/ffmpeg";
import { ChildProcess } from "child_process";

export class LiveManager {
  constructor(private ffmpeg: FFmpegManager) { }

  async start(
    channelId: number,
    inputUrl: string,
    streamKey: string,
  ): Promise<ChildProcess> {
    /*
     * ==========================================
     * CHECK EXISTING LIVE PROCESS
     * ==========================================
     */

    const existing = this.ffmpeg.get(
      channelId,
      "LIVE",
    );

    if (existing) {
      console.log(
        "⚠ LIVE already running",
        channelId,
      );

      return existing;
    }

    /*
     * ==========================================
     * VALIDATE INPUT
     * ==========================================
     */

    const normalizedInput = inputUrl.trim();

    if (!normalizedInput) {
      throw new Error(
        "Live input URL is required",
      );
    }

    if (!streamKey?.trim()) {
      throw new Error(
        "Stream key is required",
      );
    }

    /*
     * ==========================================
     * IMPORTANT
     *
     * INPUT:
     *
     * Larix / OBS
     *      ↓
     * live/{streamKey}
     *
     * Example:
     *
     * rtmp://192.168.1.100:1935/live/bc360_kids_key
     *
     * We DO NOT change the input here.
     *
     * The URL stored in Stream.url is the
     * actual external/source URL.
     * ==========================================
     */

    /*
     * ==========================================
     * INTERNAL LIVE SOURCE OUTPUT
     *
     * FFmpeg normalizes the incoming stream
     * and publishes it to:
     *
     * source/{streamKey}
     * ==========================================
     */

    const output =
      `rtmp://127.0.0.1:1935/source/${streamKey.trim()}`;

    /*
     * ==========================================
     * FFMPEG
     * ==========================================
     */

    const args = [
      "-hide_banner",
      "-loglevel",
      "warning",

      /*
       * DO NOT use -re for an already-live RTSP/RTMP source.
       */

      /*
       * INPUT
       */
      "-i",
      normalizedInput,

      /*
       * ========================================
       * VIDEO
       * ========================================
       */

      "-map",
      "0:v:0",

      "-c:v",
      "libx264",

      "-preset",
      "ultrafast",

      "-tune",
      "zerolatency",

      "-pix_fmt",
      "yuv420p",

      "-r",
      "30",

      /*
       * 2-second GOP
       */
      "-g",
      "60",

      "-keyint_min",
      "60",

      /*
       * Reduce encoder buffering
       */
      "-bf",
      "0",

      /*
       * ========================================
       * AUDIO
       * ========================================
       */

      "-map",
      "0:a:0?",

      "-c:a",
      "aac",

      "-ar",
      "48000",

      "-ac",
      "2",

      "-b:a",
      "128k",

      /*
       * ========================================
       * OUTPUT
       * ========================================
       */

      "-f",
      "flv",

      output,
    ];

    console.log(
      "🔴 START LIVE SOURCE",
      {
        channelId,
        streamKey,
        input: normalizedInput,
        output,
      },
    );

    return this.ffmpeg.start(
      channelId,
      "LIVE",
      args,
    );
  }

  /*
   * ==========================================
   * STOP LIVE
   * ==========================================
   */

  async stop(channelId: number) {
    await this.ffmpeg.stop(
      channelId,
      "LIVE",
    );

    console.log(
      "🛑 LIVE SOURCE STOP",
      channelId,
    );
  }

  /*
   * ==========================================
   * CHECK LIVE PROCESS
   * ==========================================
   */

  isRunning(channelId: number) {
    return this.ffmpeg.isRunning(
      channelId,
      "LIVE",
    );
  }
}