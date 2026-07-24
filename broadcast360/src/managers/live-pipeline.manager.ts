import { spawn, ChildProcess } from "child_process";

import { Stream } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

interface LiveState {
  stream: Stream;

  process: ChildProcess;

  startedAt: Date;
}

export class LivePipelineManager {
  private running = new Map<number, LiveState>();

  /**
   * ==========================
   * START LIVE
   * ==========================
   */
  async start(channelId: number, stream: Stream): Promise<boolean> {
    // prevent duplicate
    if (this.running.has(channelId)) {
      console.log("⚠ LIVE already running", channelId);

      return false;
    }

    const channel = await prisma.channel.findUnique({
      where: {
        id: channelId,
      },
    });

    if (!channel?.streamKey) {
      console.log("❌ Stream key missing");

      return false;
    }

    const output = `rtmp://127.0.0.1:1935/live/${channel.streamKey}`;

    console.log("====================");
    console.log("🔴 LIVE START");
    console.log("INPUT:", stream.url);
    console.log("OUTPUT:", output);
    console.log("====================");

    const args: string[] = [
      /**
       * INPUT
       */
      "-i",
      stream.url,

      /**
       * VIDEO NORMALIZE
       */
      "-c:v",
      "libx264",

      "-preset",
      "veryfast",

      "-profile:v",
      "main",

      "-pix_fmt",
      "yuv420p",

      "-r",
      "30",

      "-g",
      "60",

      "-keyint_min",
      "60",

      "-s",
      "854x480",

      /**
       * AUDIO NORMALIZE
       */
      "-c:a",
      "aac",

      "-ar",
      "48000",

      "-ac",
      "2",

      "-b:a",
      "128k",

      /**
       * OUTPUT
       */
      "-f",
      "flv",

      output,
    ];

    console.log("🚀 FFmpeg LIVE", args.join(" "));

    const ffmpeg = spawn("ffmpeg", args, {
      stdio: ["ignore", "pipe", "pipe"],
    });

    const state: LiveState = {
      stream,

      process: ffmpeg,

      startedAt: new Date(),
    };

    this.running.set(channelId, state);

    /**
     * logs
     */
    ffmpeg.stderr.on("data", (data) => {
      console.log(`[LIVE ${channelId}]`, data.toString());
    });

    /**
     * FFmpeg error
     */
    ffmpeg.on("error", (err) => {
      console.log("❌ LIVE FFmpeg error", err);

      this.running.delete(channelId);
    });

    /**
     * stopped
     */
    ffmpeg.on("close", (code, signal) => {
      console.log("🔴 LIVE CLOSED", {
        channelId,
        code,
        signal,
      });

      const current = this.running.get(channelId);

      if (current?.process === ffmpeg) {
        this.running.delete(channelId);
      }
    });

    return true;
  }

  /**
   * ==========================
   * STOP LIVE
   * ==========================
   */
  async stop(channelId:number){

    const state=this.running.get(channelId);


    if(!state){
        return;
    }


    console.log(
        "🛑 LIVE STOP",
        channelId
    );


    return new Promise<void>((resolve)=>{


        state.process.once(
            "close",
            ()=>{

                console.log(
                    "✅ LIVE FFmpeg closed",
                    channelId
                );


                this.running.delete(channelId);

                resolve();

            }
        );


        state.process.kill("SIGINT");


        setTimeout(()=>{

            if(!state.process.killed){

                state.process.kill("SIGKILL");

            }

            this.running.delete(channelId);

            resolve();

        },3000);


    });

}

  getStream(channelId: number) {
    return this.running.get(channelId)?.stream;
  }

  getStartedAt(channelId: number) {
    return this.running.get(channelId)?.startedAt;
  }

  isRunning(channelId: number) {
    return this.running.has(channelId);
  }

  /**
   * Check MediaMTX publisher
   */
  async hasPublisher(channelId: number) {

  const channel = await prisma.channel.findUnique({
    where:{
      id: channelId
    }
  });


  if(!channel?.streamKey){
    return false;
  }


  try {

    const response = await fetch(
      `http://127.0.0.1:9997/v3/paths/get/live/${channel.streamKey}`
    );


    /**
     * MediaMTX returns 404
     * when publisher disappears
     *
     * This means LIVE ended.
     */
    if(!response.ok){

      console.log(
        "⚠ MediaMTX path missing - LIVE ended"
      );

      return false;

    }


    const data = await response.json();


    return data.ready === true;


  } catch(error){

    console.log(
      "❌ MediaMTX API error",
      error
    );


    return false;

  }

}
}
