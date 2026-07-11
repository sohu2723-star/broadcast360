import { PlaylistItemWithRelations } from "@/types/playlist";


interface QueueState {
  items: PlaylistItemWithRelations[];
  loop: boolean;
}


export class PlayoutQueueManager {


  private queues =
    new Map<number, QueueState>();


  private current =
    new Map<number, PlaylistItemWithRelations>();


  /**
   * Load playlist
   */
  load(
    channelId:number,
    items:PlaylistItemWithRelations[],
    loop:boolean = false
  ){

    this.queues.set(
      channelId,
      {
        items:[...items],
        loop
      }
    );


    console.log(
      `📺 Queue loaded channel ${channelId}`,
      {
        count:items.length,
        loop
      }
    );

  }



  /**
   * Get next item
   */
  next(
    channelId:number
  ){


    const queue =
      this.queues.get(channelId);


    if(!queue || queue.items.length===0){

      console.log(
        "⚠ Queue empty",
        channelId
      );

      return null;
    }



    const item =
      queue.items.shift();



    if(!item){
      return null;
    }



    this.current.set(
      channelId,
      item
    );



    // fallback playlist loop
    if(queue.loop){

      queue.items.push(item);

    }



    return item;

  }



  getCurrent(
    channelId:number
  ){

    return this.current.get(channelId);

  }



  /**
   * Schedule switching
   */
  replace(
    channelId:number,
    items:PlaylistItemWithRelations[],
    loop:boolean=false
  ){

    console.log(
      `🔄 Replace queue ${channelId}`
    );


    this.load(
      channelId,
      items,
      loop
    );

  }



  clear(channelId:number){

    this.queues.delete(channelId);

    this.current.delete(channelId);

  }


}