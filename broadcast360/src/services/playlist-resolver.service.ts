import { PlaylistItemWithRelations } from "@/types/schedule.types";

export class PlaylistResolverService {

  resolve(items: PlaylistItemWithRelations[]) {

    return items.map((item) => {

      let videoUrl: string | null = null;

      switch (item.type) {

        case "MOVIE":
          videoUrl = item.movie?.videoUrl ?? null;
          break;

        case "ADVERTISEMENT":
          videoUrl = item.advertisement?.videoUrl ?? null;
          break;

        case "EPISODE":
          videoUrl = item.episode?.videoUrl ?? null;
          break;

        case "NEWS":
          videoUrl = item.news?.videoUrl ?? null;
          break;

        case "ENTERTAINMENT":
          videoUrl = item.entertainment?.videoUrl ?? null;
          break;

        case "STREAM":
          videoUrl = item.stream?.url ?? null;
          break;
      }


      if (!videoUrl) {
        throw new Error(
          `Missing video URL for playlist item type: ${item.type}`
        );
      }


      return videoUrl;

    });

  }

}