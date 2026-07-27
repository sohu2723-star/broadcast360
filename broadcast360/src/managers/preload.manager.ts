import { ChildProcess } from "child_process";

export class PreloadManager {

  private next = new Map<number, ChildProcess>();


  set(channelId:number, process:ChildProcess){
    this.next.set(channelId, process);
  }


  get(channelId:number){
    return this.next.get(channelId);
  }


  clear(channelId:number){

    const process = this.next.get(channelId);

    if(process){
      process.kill("SIGTERM");
    }

    this.next.delete(channelId);
  }

}