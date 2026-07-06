import { spawn } from "child_process";

export class BroadcastManager {
  private processes = new Map<number, any>();

  start(channelId: number, inputs: string[], streamKey: string) {
    const output = `rtmp://localhost:1935/live/${streamKey}`;

    const args: string[] = [];

    for (const input of inputs) {
      args.push("-re", "-i", input);
    }

    args.push(
      "-c:v", "libx264",
      "-preset", "veryfast",
      "-c:a", "aac",
      "-f", "flv",
      output
    );

    const ffmpeg = spawn("ffmpeg", args);

    this.processes.set(channelId, ffmpeg);

    ffmpeg.stderr.on("data", (d) => {
      console.log(`[FFMPEG ${channelId}]`, d.toString());
    });

    ffmpeg.on("close", () => {
      this.processes.delete(channelId);
    });
  }

  stop(channelId: number) {
    const proc = this.processes.get(channelId);
    if (!proc) return;

    proc.kill("SIGKILL");
    this.processes.delete(channelId);
  }

  isRunning(channelId: number) {
    return this.processes.has(channelId);
  }
}