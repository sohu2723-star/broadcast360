import { FFmpegManager } from "@/streaming/ffmpeg";
import { ConcatManager } from "@/managers/concat-manager";
import { ResolvedPlaylistItem } from "@/types/playlist";

export class PlayoutManager {
  private stopping = new Map<number, boolean>();
  constructor(
    private ffmpeg: FFmpegManager,
    private concat: ConcatManager,
  ) {}

  async start(
    channelId: number,
    items: ResolvedPlaylistItem[],
    offset: number,
    onFinished: () => Promise<void>,
    loop = false,
  ) {
    console.log(" START CONCAT PLAYOUT", {
      channelId,
      total: items.length,
      offset,
    });

    const concatFile = await this.concat.create(channelId, items);

    const output = `rtmp://127.0.0.1:1935/vod/${channelId}`;

    const args = [
      "-re",

      ...(loop ? ["-stream_loop", "-1"] : []),

      "-f",
      "concat",

      "-safe",
      "0",

      "-i",
      concatFile.replace(/\\/g, "/"),

      "-c:v",
      "libx264",

      "-preset",
      "veryfast",

      "-tune",
      "zerolatency",

      "-pix_fmt",
      "yuv420p",

      "-g",
      "60",

      "-c:a",
      "aac",

      "-ar",
      "48000",

      "-b:a",
      "128k",

      "-f",
      "flv",

      output,
    ];

    const process = this.ffmpeg.start(channelId, "SOURCE", args);

    process.once("close", async (code) => {
      const isStopping = this.stopping.get(channelId);

      this.stopping.delete(channelId);

      if (isStopping) {
        console.log(" IGNORE CLOSE - MANUAL STOP", {
          channelId,
          code,
        });

        return;
      }

      if (loop) {
        console.log(" LOOP PLAYLIST STOPPED", channelId);
        return;
      }

      console.log(" CONCAT FINISHED", {
        channelId,
        code,
      });

      await onFinished();
    });
  }

  async stop(channelId: number) {
    this.stopping.set(channelId, true);

    await this.ffmpeg.stop(channelId, "SOURCE");

    console.log(" PLAYOUT STOP", channelId);
  }

  isRunning(channelId: number) {
    return this.ffmpeg.isRunning(channelId, "SOURCE");
  }
}
