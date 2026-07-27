import { spawn, ChildProcess } from "child_process";

export class PlayoutManager {
  private processes = new Map<number, ChildProcess>();

  async start(
    channelId: number,
    concatFile: string,
    streamKey: string,
    offset: number = 0,
    loop: boolean = false,
  ) {
    await this.stop(channelId);

    const output = `rtmp://127.0.0.1:1935/live/${streamKey}`;

    const args = [
      "-re",

      ...(offset > 0 ? ["-ss", String(offset)] : []),

      ...(loop ? ["-stream_loop", "-1"] : []),

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

      "-pix_fmt",
      "yuv420p",

      "-g",
      "30",

      "-keyint_min",
      "60",

      "-sc_threshold",
      "0",

      "-c:a",
      "aac",

      "-ar",
      "48000",

      "-b:a",
      "128k",

      "-f",
      "flv",

      "-tune",
"zerolatency",

      output,
    ];

    console.log("🚀 CONTINUOUS PLAYOUT", args.join(" "));

    const ffmpeg = spawn("ffmpeg", args, {
      windowsHide: true,
    });

    this.processes.set(channelId, ffmpeg);

    ffmpeg.stderr.on("data", (data) => {
      console.log(`[PLAYOUT ${channelId}]`, data.toString());
    });

    ffmpeg.on("close", (code) => {
      console.log("PLAYOUT END", {
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

    if (!ffmpeg) return;

    ffmpeg.kill("SIGTERM");

    this.processes.delete(channelId);
  }

  isRunning(channelId: number) {
    return this.processes.has(channelId);
  }
}
