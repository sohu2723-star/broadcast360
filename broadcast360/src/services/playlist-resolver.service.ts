import { PlaylistItemWithRelations } from "@/types/playlist";


export interface ResolvedPlaylistItem {

  id:number;

  type:
    | "MOVIE"
    | "EPISODE"
    | "ADVERTISEMENT"
    | "ENTERTAINMENT"
    | "NEWS"
    | "STREAM";


  videoUrl?:string;

  streamUrl?:string;

  duration?:number | null;

  order:number;

}



export class PlaylistResolverService {



  /*
  ==================================
       RESOLVE PLAYLIST
  ==================================
  */


  resolve(
    items:PlaylistItemWithRelations[],
  ):ResolvedPlaylistItem[]{


    return items

      .sort(
        (a,b)=>
          a.order - b.order
      )


      .map(
        item =>
          this.resolveItem(item)
      )


      .filter(
        Boolean
      ) as ResolvedPlaylistItem[];


  }





  /*
  ==================================
       RESOLVE SINGLE ITEM
  ==================================
  */


  private resolveItem(
    item:PlaylistItemWithRelations,
  ):ResolvedPlaylistItem|null{



    switch(item.type){



      case "MOVIE":


        if(!item.movie?.videoUrl){

          return null;

        }


        return {

          id:item.id,

          type:"MOVIE",

          videoUrl:
            item.movie.videoUrl,

          duration:
            item.duration ??
            item.movie.duration,

          order:
            item.order,

        };





      case "EPISODE":


        if(!item.episode?.videoUrl){

          return null;

        }


        return {


          id:item.id,

          type:"EPISODE",


          videoUrl:
            item.episode.videoUrl,


          duration:
            item.duration ??
            item.episode.duration,


          order:
            item.order,


        };






      case "ADVERTISEMENT":


        if(!item.advertisement?.videoUrl){

          return null;

        }


        return {

          id:item.id,

          type:"ADVERTISEMENT",


          videoUrl:
            item.advertisement.videoUrl,


          duration:
            item.duration ??
            item.advertisement.duration,


          order:
            item.order,


        };







      case "ENTERTAINMENT":


        if(!item.entertainment?.videoUrl){

          return null;

        }


        return {


          id:item.id,

          type:"ENTERTAINMENT",


          videoUrl:
            item.entertainment.videoUrl,


          duration:
            item.duration ??
            item.entertainment.duration,


          order:
            item.order,


        };







      case "NEWS":


        if(!item.news?.videoUrl){

          return null;

        }


        return {


          id:item.id,

          type:"NEWS",


          videoUrl:
            item.news.videoUrl,


          duration:
            item.duration,


          order:
            item.order,


        };







      case "STREAM":


        if(!item.stream?.url){

          return null;

        }


        return {


          id:item.id,


          type:"STREAM",


          streamUrl:
            item.stream.url,


          duration:
            item.duration,


          order:
            item.order,


        };






      default:

        return null;

    }

  }


}