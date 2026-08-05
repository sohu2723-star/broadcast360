import { PlaylistItemWithRelations } from "@/types/playlist";

export interface ResolvedPlaylistItem {
  id: number;

  type:
    "MOVIE" | "EPISODE" | "ADVERTISEMENT" | "ENTERTAINMENT" | "NEWS" | "STREAM";

  videoUrl?: string;

  title? : string;

  streamUrl?: string;
  
  duration?: number | null;

  order: number;
}

export class PlaylistResolverService {
  /*
  ==================================
       RESOLVE PLAYLIST
  ==================================
  */

  resolve(items: PlaylistItemWithRelations[]): ResolvedPlaylistItem[] {
    return items
      .sort((a, b) => a.order - b.order)
      .map((item) => this.resolveItem(item))
      .filter((item): item is ResolvedPlaylistItem => item !== null);
  }

  /*
  ==================================
       RESOLVE SINGLE ITEM
  ==================================
  */

  private resolveItem(
    item: PlaylistItemWithRelations,
  ): ResolvedPlaylistItem | null {
    switch (item.type) {
      /*
      ======================
          MOVIE
      ======================
      */

      case "MOVIE":
        if (!item.movie?.videoUrl) {
          console.log("⚠ MOVIE missing video", item.id);

          return null;
        }

        return {
          id: item.id,

          type: "MOVIE",

          title: item.movie.title,

          videoUrl: item.movie.videoUrl,

          duration: item.duration ?? item.movie.duration,

          order: item.order,
        };

      /*
      ======================
          EPISODE
      ======================
      */

      case "EPISODE":
        if (!item.episode?.videoUrl) {
          console.log("⚠ EPISODE missing video", item.id);

          return null;
        }

        return {
          id: item.id,

          type: "EPISODE",

          title: item.episode.title,

          videoUrl: item.episode.videoUrl,

          duration: item.duration ?? item.episode.duration,

          order: item.order,
        };

      /*
      ======================
          ADVERTISEMENT
      ======================
      */

      case "ADVERTISEMENT":
        if (!item.advertisement?.videoUrl) {
          console.log("⚠ AD missing video", item.id);

          return null;
        }

        return {
          id: item.id,

          type: "ADVERTISEMENT",

          title: item.advertisement.title,

          videoUrl: item.advertisement.videoUrl,

          duration: item.duration ?? item.advertisement.duration,

          order: item.order,
        };

      /*
      ======================
          ENTERTAINMENT
      ======================
      */

      case "ENTERTAINMENT":
        if (!item.entertainment?.videoUrl) {
          console.log("⚠ ENTERTAINMENT missing video", item.id);

          return null;
        }

        return {
          id: item.id,

          type: "ENTERTAINMENT",

          title: item.entertainment.title,

          videoUrl: item.entertainment.videoUrl,

          duration: item.duration ?? item.entertainment.duration,

          order: item.order,
        };

      /*
      ======================
          NEWS
      ======================
      */

      case "NEWS":
        if (!item.news?.videoUrl) {
          console.log("⚠ NEWS missing video", item.id);

          return null;
        }

        return {
          id: item.id,

          type: "NEWS",

          title: item.news.title,

          videoUrl: item.news.videoUrl,

          duration: item.duration ,

          order: item.order,

          
        };

      /*
      ======================
          LIVE STREAM
      ======================
      */

      case "STREAM":
        if (!item.stream?.url) {
          console.log("⚠ STREAM missing URL", item.id);

          return null;
        }

        return {
          id: item.id,

          type: "STREAM",

          title: item.stream.name,

          streamUrl: item.stream.url,

          duration: null,

          order: item.order,
        };

      default:
        console.log("⚠ UNKNOWN PLAYLIST TYPE", item.type);

        return null;
    }
  }
}
