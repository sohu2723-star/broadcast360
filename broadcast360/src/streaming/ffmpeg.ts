import { spawn, ChildProcess } from "child_process";

type FFmpegRole = "SOURCE" | "ROUTER";

export class FFmpegManager {
  private processes = new Map<string, ChildProcess>();

  private key(channelId: number, role: FFmpegRole) {
    return `${channelId}:${role}`;
  }

  start(channelId: number, role: FFmpegRole, args: string[]): ChildProcess {
    const key = this.key(channelId, role);

    const existing = this.processes.get(key);

    if (existing) {
      console.log("⚠ FFmpeg already running", {
        channelId,
        role,
      });

      return existing;
    }

    console.log("🚀 START FFmpeg", {
      channelId,
      role,
      command: `ffmpeg ${args.join(" ")}`,
    });

    const ffmpeg = spawn("ffmpeg", args, {
      windowsHide: true,
    });

    this.processes.set(key, ffmpeg);

    ffmpeg.stderr.on("data", (data) => {
      console.log(`[FFMPEG ${channelId}:${role}]`, data.toString());
    });

    ffmpeg.on("error", (error) => {
      console.error("❌ FFmpeg error", {
        channelId,
        role,
        error,
      });

      this.remove(channelId, role, ffmpeg);
    });

    ffmpeg.on("close", (code) => {
      console.log("🛑 FFmpeg closed", {
        channelId,
        role,
        code,
      });

      this.remove(channelId, role, ffmpeg);
    });

    return ffmpeg;
  }

  async stop(channelId: number, role: FFmpegRole): Promise<void> {
    const key = this.key(channelId, role);

    const ffmpeg = this.processes.get(key);

    if (!ffmpeg) {
      return;
    }

    console.log("🛑 STOP FFmpeg", {
      channelId,
      role,
    });

    ffmpeg.kill("SIGINT");

    this.processes.delete(key);
  }

  async stopAll(channelId: number) {
    for (const role of ["SOURCE", "ROUTER"] as FFmpegRole[]) {
      await this.stop(channelId, role);
    }
  }

  isRunning(channelId: number, role?: FFmpegRole) {
    if (role) {
      return this.processes.has(this.key(channelId, role));
    }

    return ["SOURCE", "ROUTER"].some((r) =>
      this.processes.has(this.key(channelId, r as FFmpegRole)),
    );
  }

  get(channelId: number, role: FFmpegRole) {
    return this.processes.get(this.key(channelId, role)) ?? null;
  }

  has(channelId: number, role: string) {
    return this.processes.has(`${channelId}:${role}`);
  }

  private remove(channelId: number, role: FFmpegRole, process: ChildProcess) {
    const key = this.key(channelId, role);

    const current = this.processes.get(key);

    if (current !== process) {
      return;
    }

    this.processes.delete(key);
  }
}
