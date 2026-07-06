export class PlaylistResolverService {
  resolve(items: any[]) {
    return items.map((item) => {
      const url =
        item.movie?.videoUrl ||
        item.episode?.videoUrl ||
        item.advertisement?.videoUrl ||
        item.news?.videoUrl ||
        item.entertainment?.videoUrl ||
        item.stream?.url;

      if (!url) throw new Error("Missing video URL");

      return url;
    });
  }
}