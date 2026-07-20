import { PlaylistItemWithRelations } from "@/types/schedule.types";

export class PlaylistResolverService {
  resolve(item: PlaylistItemWithRelations): string | null {
    let videoUrl: string | null = null;

    switch (item.type) {
      case "MOVIE":
        videoUrl = item.movie?.videoUrl ?? null;

        break;

      case "EPISODE":
        videoUrl = item.episode?.videoUrl ?? null;

        break;

      case "ADVERTISEMENT":
        videoUrl = item.advertisement?.videoUrl ?? null;

        break;

      case "ENTERTAINMENT":
        videoUrl = item.entertainment?.videoUrl ?? null;

        break;

      case "NEWS":
        videoUrl = item.news?.videoUrl ?? null;

        break;

      case "STREAM":
        videoUrl = item.stream?.url ?? null;

        break;

      default:
        videoUrl = null;
    }

    if (!videoUrl) {
      console.log("⚠ No video URL for item:", {
        id: item.id,
        type: item.type,
      });

      return null;
    }

    console.log("✅ Resolved:", {
      id: item.id,
      type: item.type,
      url: videoUrl,
    });

    return videoUrl;
  }
}
