import { PlaylistItemRepository } from "@/repositories/playlist-item.repository";
import { PlaylistItemCreateInput } from "@/types/playlist-item";


export const PlaylistItemService = {


  create: async (
    playlistId:number,
    data:PlaylistItemCreateInput
  ) => {


    const exists =
      await PlaylistItemRepository.findByOrder(
        playlistId,
        data.order
      );


    if(exists){

      throw new Error(
        `Sequence ${data.order} already exists in this playlist`
      );

    }



    switch(data.type){


      case "MOVIE":

        return PlaylistItemRepository.createMovie(
          playlistId,
          data
        );



      case "SERIES":

        return PlaylistItemRepository.createEpisode(
          playlistId,
          data
        );



      case "ADVERTISEMENT":

        return PlaylistItemRepository.createAd(
          playlistId,
          data
        );



      case "NEWS":

        return PlaylistItemRepository.createNews(
          playlistId,
          data
        );



      case "STREAM":

        return PlaylistItemRepository.createStream(
          playlistId,
          data
        );



      case "ENTERTAINMENT":

        return PlaylistItemRepository.createEntertainment(
          playlistId,
          data
        );


      default:

        throw new Error(
          "Invalid playlist item type"
        );

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