import { spawn, ChildProcess } from "child_process";

export class LiveManager {
  private processes = new Map<number, ChildProcess>();

  async start(
    channelId: number,
    inputUrl: string,
    streamKey: string
  ): Promise<ChildProcess> {

    const existing = this.processes.get(channelId);

    if (existing) {
      console.log("⚠ LIVE already running", channelId);
      return existing;
    }

    const output = `rtmp://127.0.0.1:1935/camera/${channelId}`;

    const args = [
      "-i",
      inputUrl,

      "-c:v","libx264",
      "-preset","veryfast",
      "-tune","zerolatency",
      "-pix_fmt","yuv420p",

      "-c:a","aac",

      "-f","flv",

      output
    ];

    const ffmpeg = spawn("ffmpeg", args, {
      windowsHide: true,
    });

    this.processes.set(channelId, ffmpeg);

    ffmpeg.stderr.on("data", data=>{
      console.log(data.toString());
    });

    ffmpeg.on("close", ()=>{
      this.processes.delete(channelId);
    });

    return ffmpeg;
  }

  async stop(channelId:number): Promise<void> {

    const process = this.processes.get(channelId);

    if(!process){
      return;
    }

    process.kill("SIGINT");

    this.processes.delete(channelId);
  }

  isRunning(channelId:number):boolean{
    return this.processes.has(channelId);
  }
}