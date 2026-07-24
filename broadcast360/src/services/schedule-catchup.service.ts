import { ScheduleWithRelations } from "@/types/schedule.types";
import { PlaylistItemWithRelations } from "@/types/playlist";

export interface CatchupResult {

  itemIndex:number;

  offset:number;

}



export class ScheduleCatchupService {



  /*
  =====================================
      CALCULATE CURRENT PLAY POSITION
  =====================================
  */


  calculate(
    schedule:ScheduleWithRelations,
    now:Date,
  ):CatchupResult {



    if(!schedule.playlist?.items?.length){

      return {

        itemIndex:0,

        offset:0,

      };

    }



    /*
    seconds since schedule start
    */


    const elapsed =
      Math.floor(
        (
          now.getTime()
          -
          new Date(
            schedule.startTime
          ).getTime()

        ) / 1000
      );



    if(elapsed <= 0){

      return {

        itemIndex:0,

        offset:0,

      };

    }




    let currentTime = 0;



    const items =
      schedule.playlist.items
      .sort(
        (a,b)=>
          a.order - b.order
      );





    for(
      let i=0;
      i<items.length;
      i++
    ){



      const item =
        items[i];



      const duration =
        item.duration
        ??
        this.getDuration(item);



      if(!duration){

        continue;

      }





      /*
      Current item

      Example:

      elapsed 45 min

      Movie A 30 min

      Movie B starts at 30

      45 is inside Movie B

      */


      if(
        elapsed >= currentTime &&
        elapsed < currentTime + duration
      ){


        return {


          itemIndex:i,


          offset:
            elapsed - currentTime,


        };


      }




      currentTime += duration;


    }





    /*
    Playlist already finished
    */


    return {


      itemIndex:
        items.length,


      offset:0,


    };


  }






  /*
  =====================================
       FALLBACK DURATION
  =====================================
  */


  private getDuration(
      item:PlaylistItemWithRelations,
  ):number {



    return (

      item.movie?.duration
      ??
      item.episode?.duration
      ??
      item.advertisement?.duration
      ??
      item.entertainment?.duration
      ??
      0

    );

  }


}