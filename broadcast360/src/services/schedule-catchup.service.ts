import { ScheduleWithRelations } from "@/types/schedule.types";
import { PlaylistItemWithRelations } from "@/types/playlist";

interface CatchupResult {

  itemIndex:number;

  offset:number;

}


export class ScheduleCatchupService {


  calculate(
    schedule:ScheduleWithRelations,
    now:Date
  ):CatchupResult {


    if(!schedule.startTime){
      return {
        itemIndex:0,
        offset:0
      };
    }


    const elapsed =
      Math.floor(
        (now.getTime() -
        schedule.startTime.getTime())
        /
        1000
      );


    console.log(
      "⏱ Schedule elapsed:",
      elapsed,
      "seconds"
    );



    let currentTime = 0;



    const items =
      schedule.playlist?.items ?? [];



    for(
      let i=0;
      i<items.length;
      i++
    ){

      const duration =
        this.getDuration(items[i]);



      if(
        elapsed <
        currentTime + duration
      ){

        return {

          itemIndex:i,

          offset:
            elapsed-currentTime

        };

      }


      currentTime += duration;

    }



    // schedule already finished

    return {

      itemIndex:
        items.length-1,

      offset:0

    };

  }





  private getDuration(item: PlaylistItemWithRelations) {


    if(item.movie){
      return item.movie.duration;
    }


    if(item.episode){
      return item.episode.duration;
    }


    if(item.advertisement){
      return item.advertisement.duration;
    }


    return 0;

  }


}