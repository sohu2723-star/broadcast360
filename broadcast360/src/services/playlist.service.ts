import { PlaylistRepository } from "@/repositories/playlist.repository";
import { PlaylistCreateInput } from "@/types/playlist";


export const PlaylistService = {


  createPlaylist: async (
    programId: number,
    data: PlaylistCreateInput
  ) => {

    if (!programId || isNaN(programId)) {

      throw new Error(
        "Invalid programId"
      );

    }


    return PlaylistRepository.create(
      programId,
      data
    );

  },

  getProgramPlaylists: async(
 programId:number,
 page:number,
 limit:number
)=>{


return PlaylistRepository.findByProgramId(
 programId,
 page,
 limit
);


},

  getPlaylistById: async (
    id: number
  ) => {

    return PlaylistRepository.findById(id);

  },

  updatePlaylist: async (

    id: number,

    data: {
      name: string
    }

  ) => {


    if (!id || isNaN(id)) {

      throw new Error(
        "Invalid playlist id"
      );

    }



    return PlaylistRepository.update(

      id,

      data

    );


  },

  deletePlaylist: async (id: number) => {
  return PlaylistRepository.delete(id);
},


};