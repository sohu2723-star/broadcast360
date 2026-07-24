import { ChildProcess } from "child_process";
import path from "path";

import { FFmpegManager } from "@/streaming/ffmpeg";
import { ResolvedPlaylistItem } from "@/types/playlist";

export class PlayoutManager {
  private queues = new Map<number, ResolvedPlaylistItem[]>();

  private indexes = new Map<number, number>();

  private processes = new Map<number, ChildProcess>();

  constructor(private ffmpeg: FFmpegManager) {}

  /*
  ==================================
        START PLAYOUT
  ==================================
  */

  async start(
    channelId: number,
    items: ResolvedPlaylistItem[],
    streamKey: string,
    startIndex: number = 0,
    offset: number = 0,
    onFinished: () => Promise<void>,
  ): Promise<void> {
    console.log("▶ START PLAYOUT", {
      channelId,
      total: items.length,
      startIndex,
    });

    this.queues.set(channelId, items);

    this.indexes.set(channelId, startIndex);

    await this.playNext(channelId, streamKey, offset, onFinished);
  }

  /*
  ==================================
        PLAY NEXT ITEM
  ==================================
  */

  private async playNext(
    channelId: number,
    streamKey: string,
    offset: number,
    onFinished: () => Promise<void>,
  ): Promise<void> {
    const queue = this.queues.get(channelId);

    if (!queue) {
      return;
    }

    const index = this.indexes.get(channelId) ?? 0;

    const item = queue[index];

    if (!item) {
      console.log("✅ PLAYLIST COMPLETE", channelId);

      await onFinished();

      return;
    }

    console.log("▶ PLAY ITEM", {
      id: item.id,
      type: item.type,
      index,
    });

    /*
  ===============================
        STREAM ITEM
  ===============================
  */

   /*
===============================
      NON-VOD ITEM
===============================
*/

if (!item.videoUrl) {
  console.log("⚠ Skip non-video item", item.type);

  this.nextIndex(channelId);

  return this.playNext(
    channelId,
    streamKey,
    0,
    onFinished,
  );
}
    /*
  ===============================
        VOD ITEM
  ===============================
  */

    const concatFile = path.join(
      process.cwd(),
      "tmp",
      `channel-${channelId}.txt`,
    );

    const output =
  `rtmp://127.0.0.1:1935/live/${streamKey}`;

    const args: string[] = [
      "-re",

      "-f",
      "concat",

      "-safe",
      "0",

      "-i",
      concatFile,

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

    console.log("🚀 START CONCAT VOD", {
      id: item.id,
      file: concatFile,
    });

    const ffmpegProcess = this.ffmpeg.start(channelId, args);

    this.processes.set(channelId, ffmpegProcess);

    ffmpegProcess.once("close", async (code) => {
      console.log("✅ CONCAT FINISHED", {
        channelId,
        code,
      });

      this.processes.delete(channelId);

      await onFinished();
    });
  }

  /*
  ==================================
          NEXT INDEX
  ==================================
  */

  private nextIndex(channelId: number) {
    const current = this.indexes.get(channelId) ?? 0;

    this.indexes.set(channelId, current + 1);
  }

  /*
  ==================================
             STOP
  ==================================
  */

  async stop(channelId: number): Promise<void> {
    await this.ffmpeg.stop(channelId);

    this.queues.delete(channelId);

    this.indexes.delete(channelId);

    this.processes.delete(channelId);

    console.log("🛑 PLAYOUT STOP", channelId);
  }

  /*
  ==================================
             STATUS
  ==================================
  */

  isRunning(channelId: number): boolean {
    return this.processes.has(channelId);
  }
}
