import { spawn, ChildProcess } from "child_process";

export type FFmpegRole = "SOURCE" | "ROUTER" | "LIVE";

export class FFmpegManager {
  private processes = new Map<string, ChildProcess>();

  private manualStops = new Set<string>();

  private key(channelId: number, role: FFmpegRole) {
    return `${channelId}:${role}`;
  }

  start(
    channelId: number,
    role: FFmpegRole,
    args: string[],
  ): ChildProcess {
    const key = this.key(channelId, role);

    const existing = this.processes.get(key);

    if (existing && !existing.killed) {
      console.log("⚠ FFmpeg already running", {
        channelId,
        role,
      });

      return existing;
    }

    console.log("🚀 START FFMPEG", {
      channelId,
      role,
      command: `ffmpeg ${args.join(" ")}`,
    });

    const process = spawn("ffmpeg", args, {
      windowsHide: true,
    });

    this.processes.set(key, process);

    process.stderr.on("data", (data) => {
      console.log(`[FFMPEG ${channelId}:${role}]`, data.toString());
    });

    process.once("close", (code) => {
      const manual = this.manualStops.has(key);

      if (manual) {
        this.manualStops.delete(key);

        console.log("⏹ IGNORE CLOSE - MANUAL STOP", {
          channelId,
          role,
          code,
        });
      } else {
        console.log("🛑 FFMPEG CLOSED", {
          channelId,
          role,
          code,
        });
      }

      this.remove(channelId, role, process);
    });

    process.once("error", (err) => {
      console.error("❌ FFMPEG ERROR", {
        channelId,
        role,
        err,
      });

      this.remove(channelId, role, process);
    });

    return process;
  }

  async stop(channelId: number, role: FFmpegRole) {
    const key = this.key(channelId, role);

    const process = this.processes.get(key);

    if (!process) {
      return;
    }

    console.log("🛑 STOP FFMPEG", {
      channelId,
      role,
    });

    this.manualStops.add(key);

    process.kill("SIGINT");

    await new Promise<void>((resolve) => {
      process.once("close", () => resolve());
    });
  }

  async stopAll(channelId: number) {
    for (const role of ["SOURCE", "ROUTER", "LIVE"] as FFmpegRole[]) {
      await this.stop(channelId, role);
    }
  }

  has(channelId: number, role: FFmpegRole) {
    return this.processes.has(this.key(channelId, role));
  }

  isRunning(channelId: number, role?: FFmpegRole) {
    if (role) {
      return this.has(channelId, role);
    }

    return (
      this.has(channelId, "SOURCE") ||
      this.has(channelId, "ROUTER") ||
      this.has(channelId, "LIVE")
    );
  }

  get(channelId: number, role: FFmpegRole) {
    return this.processes.get(this.key(channelId, role)) ?? null;
  }

  private remove(
    channelId: number,
    role: FFmpegRole,
    process: ChildProcess,
  ) {
    const key = this.key(channelId, role);

    const current = this.processes.get(key);

    if (current !== process) {
      return;
    }

    this.processes.delete(key);

    this.manualStops.delete(key);
  }
}