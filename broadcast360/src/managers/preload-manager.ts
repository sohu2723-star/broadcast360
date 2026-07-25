import { ChildProcess } from "child_process";
import { ResolvedPlaylistItem } from "@/types/playlist";


interface PreloadData {

  item: ResolvedPlaylistItem;

  process: ChildProcess;

  preloadPath:string;

}


export class PreloadManager {


  private cache =
    new Map<number, PreloadData>();



  set(
    channelId:number,
    data:PreloadData
  ){

    this.cache.set(
      channelId,
      data
    );

  }



  get(
    channelId:number
  ){

    return this.cache.get(channelId);

  }



  clear(
    channelId:number
  ){

    const data =
      this.cache.get(channelId);


    if(data?.process){

      data.process.kill("SIGINT");

    }


    this.cache.delete(channelId);

  }



}