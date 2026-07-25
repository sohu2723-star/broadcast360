import path from "path";

import { FFmpegManager } from "@/streaming/ffmpeg";
import { ResolvedPlaylistItem } from "@/types/playlist";
import { ChildProcess } from "child_process";

export class PlayoutManager {
  private queues = new Map<number, ResolvedPlaylistItem[]>();

  private indexes = new Map<number, number>();

  private processes = new Map<number, ChildProcess>();

  constructor(
    private ffmpeg: FFmpegManager,
    private onLiveRequested: (
      channelId: number,
      url: string,
      streamKey: string,
    ) => Promise<void>,
  ) {}

  async start(
    channelId: number,
    items: ResolvedPlaylistItem[],
    streamKey: string,
    startIndex = 0,
    offset = 0,
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

    if (item.type === "STREAM") {
      console.log("🔴 STREAM ITEM", {
        id: item.id,
        url: item.streamUrl,
      });

      if (!item.streamUrl) {
        console.log("⚠ STREAM URL missing", item.id);

        this.nextIndex(channelId);

        return this.playNext(channelId, streamKey, 0, onFinished);
      }

      await this.onLiveRequested(channelId, item.streamUrl, streamKey);

      return;
    }

    if (!item.videoUrl) {
      console.log("⚠ Missing video", item.id);

      this.nextIndex(channelId);

      return this.playNext(channelId, streamKey, 0, onFinished);
    }

    const videoPath = path.join(process.cwd(), "public", item.videoUrl);

    const output = `rtmp://127.0.0.1:1935/vod/${channelId}`;

    const args = [
      "-re",

      ...(offset > 0 ? ["-ss", String(offset)] : []),

      "-i",
      videoPath,

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

    console.log("🚀 START VOD", {
      id: item.id,
      file: videoPath,
    });

    const ffmpegProcess = this.ffmpeg.start(channelId,"SOURCE", args);

    this.processes.set(channelId, ffmpegProcess);

    ffmpegProcess.once("close", async (code) => {
      console.log("✅ ITEM FINISHED", {
        channelId,
        id: item.id,
        code,
      });

      this.processes.delete(channelId);

      this.nextIndex(channelId);

      await this.playNext(channelId, streamKey, 0, onFinished);
    });
  }

  private nextIndex(channelId: number) {
    const current = this.indexes.get(channelId) ?? 0;

    this.indexes.set(channelId, current + 1);
  }

  async stop(channelId: number) {
    await this.ffmpeg.stop(channelId, "SOURCE");

    this.queues.delete(channelId);

    this.indexes.delete(channelId);

    this.processes.delete(channelId);

    console.log("🛑 PLAYOUT STOP", channelId);
  }

  isRunning(channelId: number) {
    return this.ffmpeg.isRunning(channelId);
  }
}
