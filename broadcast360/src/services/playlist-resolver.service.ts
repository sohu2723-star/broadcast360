import { PlaylistItemWithRelations } from "@/types/schedule.types";

export class PlaylistResolverService {


  resolve(
    item: PlaylistItemWithRelations
  ): string | null {


    switch(item.type){

      case "MOVIE":
        return item.movie?.videoUrl ?? null;


      case "EPISODE":
        return item.episode?.videoUrl ?? null;


      case "ADVERTISEMENT":
        return item.advertisement?.videoUrl ?? null;


      case "ENTERTAINMENT":
        return item.entertainment?.videoUrl ?? null;


      case "NEWS":
        return item.news?.videoUrl ?? null;


      case "STREAM":
        return item.stream?.url ?? null;


      default:
        return null;

    }

  }

}