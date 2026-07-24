import { spawn, ChildProcess } from "child_process";

export class FFmpegManager {
  private processes = new Map<number, ChildProcess>();

  /*
  ==============================W
        START PROCESS
  ==============================
  */

  start(channelId: number, args: string[]): ChildProcess {
    const existing = this.processes.get(channelId);

    if (existing) {
      console.log("⚠ FFmpeg already running", channelId);

      return existing;
    }

    console.log("🚀 START FFmpeg", {
      channelId,
      command: `ffmpeg ${args.join(" ")}`,
    });

    const ffmpeg = spawn("ffmpeg", args, {
      windowsHide: true,
    });

    this.processes.set(channelId, ffmpeg);

    /*
    ==========================
        LOG OUTPUT
    ==========================
    */

    ffmpeg.stdout?.on("data", (data) => {
      console.log(`[FFMPEG OUT ${channelId}]`, data.toString());
    });

    ffmpeg.stderr.on("data", (data) => {
      const text = data.toString();

      console.log(`[FFMPEG ${channelId}]`, text);
    });

    /*
    ==========================
        ERROR
    ==========================
    */

    ffmpeg.on("error", (error) => {
      console.error("❌ FFmpeg spawn error", {
        channelId,
        error,
      });

      this.remove(channelId, ffmpeg);
    });

    /*
    ==========================
        CLOSED
    ==========================
    */

    ffmpeg.on("close", (code) => {
      console.log("🛑 FFmpeg closed", {
        channelId,
        code,
      });

      this.remove(channelId, ffmpeg);
    });

    return ffmpeg;
  }

  /*
  ==============================
        STOP
  ==============================
  */

  async stop(channelId: number): Promise<void> {
    const ffmpeg = this.processes.get(channelId);

    if (!ffmpeg) {
      return;
    }

    console.log("🛑 STOP FFmpeg", channelId);

    await new Promise<void>((resolve) => {
      let finished = false;

      const done = () => {
        if (finished) {
          return;
        }

        finished = true;

        resolve();
      };

      ffmpeg.once("close", done);

      ffmpeg.kill("SIGINT");

      setTimeout(done, 3000);
    });

    this.processes.delete(channelId);
  }

  /*
  ==============================
        STATUS
  ==============================
  */

  isRunning(channelId: number): boolean {
    return this.processes.has(channelId);
  }

  get(channelId: number): ChildProcess | null {
    return this.processes.get(channelId) ?? null;
  }

  /*
  ==============================
        REMOVE SAFE
  ==============================
  */

  private remove(channelId: number, process: ChildProcess) {
    const current = this.processes.get(channelId);

    /*
      Important:
      Ignore old ffmpeg close event
    */

    if (current !== process) {
      return;
    }

    this.processes.delete(channelId);
  }
}
