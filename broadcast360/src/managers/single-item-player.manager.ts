import { FFmpegManager } from "./ffmpeg.manager";

export class SingleItemPlayer {

  private ffmpeg = new FFmpegManager();

  async play(
    channelId: number,
    videoPath: string,
    outputDir: string
  ) {

    console.log(
      "▶ Playing",
      videoPath
    );

    return this.ffmpeg.playSingle(
      channelId,
      videoPath,
      outputDir
    );

  }

}