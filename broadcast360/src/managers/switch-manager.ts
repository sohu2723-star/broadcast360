import { ChildProcess } from "child_process";

import { FFmpegManager } from "@/streaming/ffmpeg";
import { LiveManager } from "@/managers/live-manager";

type BroadcastMode = "STOPPED" | "VOD" | "LIVE";


export class SwitchManager {

  private mode = new Map<number, BroadcastMode>();

  private current = new Map<number, ChildProcess>();


  private live: LiveManager;

  constructor(private ffmpeg: FFmpegManager) {
    this.live = new LiveManager(ffmpeg);
  }


  /*
  ==========================
        STOP ROUTER
  ==========================
  */

  async stopCurrent(channelId: number) {

    try {

      await Promise.race([

        this.ffmpeg.stop(
          channelId,
          "ROUTER"
        ),

        new Promise(resolve =>
          setTimeout(resolve, 3000)
        )

      ]);

    } catch (error) {

      console.error(
        "❌ ROUTER STOP ERROR",
        error
      );

    }


    this.current.delete(channelId);


    this.mode.set(
      channelId,
      "STOPPED"
    );


    console.log(
      "🛑 ROUTER STOPPED",
      channelId
    );
  }



  /*
  ==========================
        SWITCH VOD
  ==========================
  */


  async switchToVOD(
    channelId: number,
    streamKey: string
  ) {


    await this.stopCurrent(channelId);



    const input =
      `rtmp://127.0.0.1:1935/vod/${channelId}`;



    const output =
      `rtmp://127.0.0.1:1935/channel/${streamKey}`;


    const args = [

      "-re",


      "-fflags",
      "+genpts",


      "-i",
      input,


      "-map",
      "0:v:0",


      "-map",
      "0:a:0?",


      "-c:v",
      "copy",


      "-c:a",
      "aac",


      "-ar",
      "48000",


      "-b:a",
      "128k",


      "-f",
      "flv",


      output

    ];



    console.log(
      "🎬 ROUTE VOD",
      {
        input,
        output
      }
    );



    const process =
      this.ffmpeg.start(
        channelId,
        "ROUTER",
        args
      );



    this.current.set(
      channelId,
      process
    );


    this.mode.set(
      channelId,
      "VOD"
    );

  }





  /*
  ==========================
        SWITCH LIVE
  ==========================
  */


  async switchToLIVE(
    channelId: number,
    streamKey: string
  ) {


    await this.stopCurrent(channelId);



    const input =
      `rtmp://127.0.0.1:1935/source/${streamKey}`;



    const output =
      `rtmp://127.0.0.1:1935/channel/${streamKey}`;



    const args = [


      "-re",


      "-fflags",
      "+genpts",


      "-i",
      input,


      "-map",
      "0:v:0",


      "-map",
      "0:a:0?",



      /*
        keep video,
        encode audio
      */

      "-c:v",
      "copy",


      "-c:a",
      "aac",


      "-ar",
      "48000",


      "-b:a",
      "128k",



      "-f",
      "flv",


      output

    ];



    console.log(
      "🔴 ROUTE LIVE",
      {
        input,
        output
      }
    );



    const process =
      this.ffmpeg.start(
        channelId,
        "ROUTER",
        args
      );



    this.current.set(
      channelId,
      process
    );



    this.mode.set(
      channelId,
      "LIVE"
    );

  }





  /*
  ==========================
        STATUS
  ==========================
  */


  getMode(channelId: number) {

    return (
      this.mode.get(channelId)
      ??
      "STOPPED"
    );

  }



  isRunning(channelId: number) {
    return this.ffmpeg.isRunning(channelId, "ROUTER");
  }

  async startLIVE(channelId: number, inputUrl: string, streamKey: string) {
    await this.live.start(channelId, inputUrl, streamKey);
    await this.switchToLIVE(channelId, streamKey);
  }

  async startVOD(
    channelId: number,
    filePath: string,
    streamKey: string,
    offsetSeconds = 0,
  ) {
    await this.stopCurrent(channelId);

    const input = [
      ...(offsetSeconds > 0 ? ["-ss", String(offsetSeconds)] : []),
      "-re",
      "-i",
      filePath,
      "-map",
      "0:v:0",
      "-map",
      "0:a:0?",
      "-c:v",
      "copy",
      "-c:a",
      "aac",
      "-ar",
      "48000",
      "-b:a",
      "128k",
      "-f",
      "flv",
      `rtmp://127.0.0.1:1935/channel/${streamKey}`,
    ];

    const process = this.ffmpeg.start(channelId, "ROUTER", input);
    this.current.set(channelId, process);
    this.mode.set(channelId, "VOD");
    return process;
  }

  async stop(channelId: number) {
    await this.stopCurrent(channelId);
    await this.ffmpeg.stop(channelId, "LIVE");
  }

  hasLivePublisher(channelId: number) {
    return this.ffmpeg.isRunning(channelId, "LIVE");
  }

}