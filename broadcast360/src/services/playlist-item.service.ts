import { PlaylistItemRepository } from "@/repositories/playlist-item.repository";
import { PlaylistItemCreateInput } from "@/types/playlist-item";


export const PlaylistItemService = {

create: async (
  playlistId: number,
  data: PlaylistItemCreateInput,
) => {
  // Get the last item in this playlist
  const lastItem =
    await PlaylistItemRepository.getLastByPlaylistId(
      playlistId,
    );

  // Automatically assign the next order
  const nextOrder = (lastItem?.order ?? 0) + 1;

  const itemData = {
    ...data,
    order: nextOrder,
  };

  switch (data.type) {
    case "MOVIE":
      return PlaylistItemRepository.createMovie(
        playlistId,
        itemData,
      );

    case "SERIES":
      return PlaylistItemRepository.createEpisode(
        playlistId,
        itemData,
      );

    case "ADVERTISEMENT":
      return PlaylistItemRepository.createAd(
        playlistId,
        itemData,
      );

    case "NEWS":
      return PlaylistItemRepository.createNews(
        playlistId,
        itemData,
      );

    case "STREAM":
      return PlaylistItemRepository.createStream(
        playlistId,
        itemData,
      );

    case "ENTERTAINMENT":
      return PlaylistItemRepository.createEntertainment(
        playlistId,
        itemData,
      );

    default:
      throw new Error("Invalid playlist item type");
  }
},

  getByPlaylistId: async (playlistId: number) => {
  const items =
    await PlaylistItemRepository.getByPlaylistId(playlistId);

  return items.map((item) => {
    let duration = 0;

    switch (item.type) {
      case "MOVIE":
        duration = item.movie?.duration ?? 0;
        break;

      case "EPISODE":
        duration = item.episode?.duration ?? 0;
        break;

      case "ADVERTISEMENT":
        duration = item.advertisement?.duration ?? 0;
        break;

      case "ENTERTAINMENT":
        duration = item.entertainment?.duration ?? 0;
        break;
    }

    return {
      ...item,
      duration,
    };
  });
},

  delete: async (id: number) => {
  if (!id || isNaN(id)) {
    throw new Error("Invalid playlist item id");
  }

  return PlaylistItemRepository.deleteItem(id);
},


};