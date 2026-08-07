import { FFmpegManager } from "@/streaming/ffmpeg";
import path from "path";

export class RecordingManager {
  private active = new Map<
    number,
    {
      title: string;
      output: string;
      startedAt: Date;
    }
  >();

  constructor(private ffmpeg: FFmpegManager) {}

  async start(channelId: number, streamKey: string, title: string) {

  const startedAt = new Date();

  const input =
    `rtmp://127.0.0.1:1935/channel/${streamKey}`;


  const output = path.join(
  process.cwd(),
  "storage",
  "recordings",
  `${channelId}-${Date.now()}.mp4`
);

const args = [
  "-i",
  input,

  // Copy raw streams to avoid wasting CPU
  "-c",
  "copy",

  // Enable fragmented MP4 writing for crash resilience
  "-movflags",
  "frag_keyframe+empty_moov",

  "-f",
  "mp4",

  output,
];


  this.ffmpeg.start(
    channelId,
    "RECORD",
    args
  );


  this.active.set(channelId,{
    title,
    output,
    startedAt
  });


  console.log(
    "🔴 RECORDING STARTED",
    output
  );


  return {
    title,
    output,
    startedAt
  };
}

  async stop(channelId: number) {
    const active = this.active.get(channelId);

    if (!active) {
      console.log("⚠ NO ACTIVE RECORDING", channelId);

      return null;
    }

    await this.ffmpeg.stop(channelId, "RECORD");

    const endedAt = new Date();

    const duration = Math.floor(
      (endedAt.getTime() - active.startedAt.getTime()) / 1000,
    );

    this.active.delete(channelId);

    console.log("⏹ RECORDING STOPPED", {
      channelId,
      duration,
    });

    return {
      ...active,
      duration,
      endedAt,
    };
  }

  isRecording(channelId: number) {
    return this.active.has(channelId);
  }
}
