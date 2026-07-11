import { PlaylistItemWithRelations } from "@/types/playlist";


export class PlayoutQueueManager {


  // channelId -> playlist items
  private queues =
    new Map<number, PlaylistItemWithRelations[]>();


  // current playing item
  private current =
    new Map<number, PlaylistItemWithRelations>();



  /**
   * Load new playlist
   */
  load(
    channelId:number,
    items:PlaylistItemWithRelations[]
  ){

    this.queues.set(
      channelId,
      [...items]
    );


    console.log(
      `📺 Queue loaded channel ${channelId}`,
      items.length
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



    if(!queue || queue.length === 0){

      console.log(
        "⚠ Queue empty",
        channelId
      );

      return null;

    }



    const item =
      queue.shift();



    if(!item){
      return null;
    }



    // save current

    this.current.set(
      channelId,
      item
    );



    /*
       Put back to end

       This creates loop behavior

       A
       B
       C

       next:
       A

       queue:
       B
       C
       A

    */

    queue.push(item);



    return item;

  }




  /**
   * Current playing item
   */
  getCurrent(
    channelId:number
  ){

    return this.current.get(channelId);

  }




  /**
   * Replace playlist
   *
   * Used when schedule switches
   */
  replace(
    channelId:number,
    items:PlaylistItemWithRelations[]
  ){

    console.log(
      `🔄 Replace queue channel ${channelId}`
    );


    this.load(
      channelId,
      items
    );

  }




  clear(
    channelId:number
  ){

    this.queues.delete(channelId);

    this.current.delete(channelId);


  }


}