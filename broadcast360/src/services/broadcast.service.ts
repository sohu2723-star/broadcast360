import { SessionManager } from "@/managers/session.manager";
import { FFmpegManager } from "@/managers/ffmpeg.manager";
import { getDefaultPlaylist } from "@/repositories/channel.repository";
import { ScheduleWithRelations } from "@/types/schedule.types";
import { PlaylistItemWithRelations } from "@/types/playlist";
import { BroadcastStateManager } from "@/managers/broadcast-state.manager";
import { ConcatManager } from "@/managers/concat.manager";


export class BroadcastService {

  private session = new SessionManager();

  private ffmpeg = new FFmpegManager();

  private state = new BroadcastStateManager();

  private concat = new ConcatManager();


  // keep current playlist items per channel
  private currentItems =
    new Map<number, PlaylistItemWithRelations>();



  /**
   * START BROADCAST
   */
  async start(
    schedule: ScheduleWithRelations | null,
    channelId: number
  ): Promise<void> {


    console.log(
      "DEBUG channelId:",
      channelId
    );


    // prevent duplicate stream
    if (this.session.isLive(channelId)) {

      console.log(
        "⚠ Channel already live"
      );

      return;
    }



    let playlist;



    // ==========================
    // 1. Scheduled playlist
    // ==========================

    if (schedule?.playlist) {


      playlist = schedule.playlist;


      console.log(
        "📺 Using scheduled playlist:",
        playlist.name
      );


    }


    // ==========================
    // 2. Default playlist
    // ==========================

    else {


      const channel =
        await getDefaultPlaylist(channelId);


      playlist =
        channel?.defaultPlaylist;



      if (!playlist) {

        console.log(
          "⚠ No default playlist"
        );

        return;
      }



      console.log(
        "📺 Using default playlist:",
        playlist.name
      );

    }




    const items =
      playlist.items;



    console.log(
      "Playlist items:",
      items.length
    );



    if (!items || items.length === 0) {

      console.log(
        "⚠ Playlist has no items"
      );

      return;
    }




    // save first item state
    this.currentItems.set(
      channelId,
      items[0]
    );



    this.state.start(
      channelId,
      items[0]
    );




    // start session

    this.session.start(
      channelId
    );





    // create concat file

    const concatFile =
      this.concat.create(
        channelId,
        items
      );





    const outputDir =
      `./public/streams/channel-${channelId}`;





    console.log(
      "🚀 Starting continuous FFmpeg pipeline"
    );





    const ffmpeg =
      this.ffmpeg.start(
        channelId,
        concatFile,
        outputDir
      );





    if (!ffmpeg) {

      console.log(
        "❌ FFmpeg failed"
      );


      this.session.stop(channelId);


      return;
    }





    ffmpeg.on(
      "close",
      (code) => {


        console.log(
          `❌ FFmpeg stopped channel ${channelId} code ${code}`
        );



        this.session.stop(
          channelId
        );



        this.currentItems.delete(
          channelId
        );

      }
    );



    console.log(
      `▶ Channel ${channelId} broadcast started`
    );

  }




  /**
   * STOP BROADCAST
   */
  stop(
    channelId:number
  ):void {


    this.ffmpeg.stop(
      channelId
    );


    this.session.stop(
      channelId
    );



    this.currentItems.delete(
      channelId
    );



    console.log(
      `🛑 Broadcast stopped channel ${channelId}`
    );

  }





  /**
   * CURRENT PLAYING ITEM
   */
  getCurrentItem(
    channelId:number
  ) {


    return this.currentItems.get(
      channelId
    );

  }


}