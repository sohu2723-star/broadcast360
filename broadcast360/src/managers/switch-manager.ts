import { spawn, ChildProcess } from "child_process";

type StreamMode = "VOD" | "LIVE" | "STOPPED";

export class SwitchManager {
  private processes = new Map<number, ChildProcess>();

  private modes = new Map<number, StreamMode>();

  private liveSources = new Map<number, string>();

  private switching = new Map<number, boolean>();

  /*
  ==============================
        MODE
  ==============================
  */

  getMode(channelId: number): StreamMode {
    return this.modes.get(channelId) ?? "STOPPED";
  }

  isLIVE(channelId: number) {
    return this.getMode(channelId) === "LIVE";
  }

  isVOD(channelId: number) {
    return this.getMode(channelId) === "VOD";
  }

  /*
  ==============================
        LOCK
  ==============================
  */

  private async lock(channelId: number) {
    while (this.switching.get(channelId)) {
      await new Promise((r) => setTimeout(r, 200));
    }

    this.switching.set(channelId, true);
  }

  private unlock(channelId: number) {
    this.switching.delete(channelId);
  }

  /*
  ==============================
        START VOD
  ==============================
  */

  async startVOD(
    channelId: number,
    filePath: string,
    streamKey: string,
    offset: number = 0,
  ) {
    await this.lock(channelId);

    try {
      await this.stopVOD(channelId);

      const rtmp = `rtmp://127.0.0.1:1935/live/${streamKey}`;

      const args = [
        "-re",

        ...(offset > 0 ? ["-ss", String(offset)] : []),

        "-i",
        filePath,

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

        "-keyint_min",
        "60",

        "-sc_threshold",
        "0",

        "-c:a",
        "aac",

        "-ar",
        "48000",

        "-ac",
        "2",

        "-b:a",
        "128k",

        "-f",
        "flv",

        rtmp,
      ];

      console.log("🚀 VOD START", args.join(" "));

      const ffmpeg = spawn("ffmpeg", args, {
        windowsHide: true,
      });

      this.processes.set(channelId, ffmpeg);

      this.modes.set(channelId, "VOD");

      ffmpeg.stderr.on("data", (data) => {
        console.log(`[VOD-${channelId}]`, data.toString());
      });

      ffmpeg.on("close", (code) => {
        console.log("🎬 VOD END", {
          channelId,
          code,
        });

        if (this.processes.get(channelId) === ffmpeg) {
          this.processes.delete(channelId);

          this.modes.set(channelId, "STOPPED");
        }
      });

      return ffmpeg;
    } finally {
      this.unlock(channelId);
    }
  }

  /*
  ==============================
        STOP VOD
  ==============================
  */

  async stopVOD(channelId: number) {
    const process = this.processes.get(channelId);

    if (!process) {
      return;
    }

    console.log("🛑 STOP VOD", channelId);

    return new Promise<void>((resolve) => {
      let done = false;

      const finish = () => {
        if (done) return;

        done = true;

        this.processes.delete(channelId);

        if (this.getMode(channelId) === "VOD") {
          this.modes.set(channelId, "STOPPED");
        }

        resolve();
      };

      process.once("close", finish);

      try {
        process.kill("SIGTERM");
      } catch {
        finish();
      }

      setTimeout(() => {
        if (!done) {
          console.log("⚠ Force kill ffmpeg");

          try {
            process.kill("SIGKILL");
          } catch {}
        }
      }, 3000);
    });
  }

  /*
  ==============================
        LIVE
  ==============================
  */

  async startLIVE(channelId: number, source: string) {
    await this.lock(channelId);

    try {
      await this.stopVOD(channelId);

      console.log("🔴 LIVE START", {
        channelId,
        source,
      });

      this.liveSources.set(channelId, source);

      this.modes.set(channelId, "LIVE");

      return true;
    } finally {
      this.unlock(channelId);
    }
  }

  async stopLIVEOnly(channelId: number) {
    console.log("🔴 LIVE STOP", channelId);

    this.liveSources.delete(channelId);

    this.modes.set(channelId, "STOPPED");
  }

  /*
  ==============================
        LIVE CHECK
  ==============================
  */

  async hasLivePublisher(channelId: number) {
    const source = this.liveSources.get(channelId);

    if (!source) {
      return false;
    }

    try {
      const path = source.split("/").pop();

      const response = await fetch(
        `http://127.0.0.1:9997/v3/paths/get/live/${path}`,
      );

      if (!response.ok) {
        return false;
      }

      const data = await response.json();

      return Boolean(data?.source);
    } catch (error) {
      console.log("MediaMTX check error", error);

      return false;
    }
  }

  /*
  ==============================
        STOP ALL
  ==============================
  */

  async stop(channelId: number) {
    await this.lock(channelId);

    try {
      await this.stopVOD(channelId);

      await this.stopLIVEOnly(channelId);
    } finally {
      this.unlock(channelId);
    }
  }
}
