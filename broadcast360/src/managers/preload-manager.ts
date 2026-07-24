import { ChildProcess } from "child_process";


export class PreloadManager {

  private processes =
    new Map<number, ChildProcess>();


  set(
    channelId:number,
    process:ChildProcess
  ){

    this.processes.set(
      channelId,
      process
    );

  }


  get(
    channelId:number
  ){

    return this.processes.get(
      channelId
    );

  }


  clear(
    channelId:number
  ){

    this.processes.delete(
      channelId
    );

  }

}