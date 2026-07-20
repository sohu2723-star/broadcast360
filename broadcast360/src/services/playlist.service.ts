import { PlaylistRepository } from "@/repositories/playlist.repository";
import { PlaylistCreateInput } from "@/types/playlist";

export const PlaylistService = {
  // CREATE
  createPlaylist: async (
    programId: number,
    data: PlaylistCreateInput
  ) => {
    if (!programId || isNaN(programId)) {
      throw new Error("Invalid programId");
    }

    if (!data.name || data.name.trim() === "") {
      throw new Error("Playlist name is required");
    }

    return PlaylistRepository.create(programId, data);
  },

  // GET PROGRAM PLAYLISTS (PAGINATION)
 getProgramPlaylists: async (
  programId: number,
  page: number = 1,
  limit: number = 10
) => {
  if (!programId || isNaN(programId)) {
    throw new Error("Invalid programId");
  }

  const safePage = Math.max(1, page);
  const safeLimit = Math.max(1, limit);

  const data = await PlaylistRepository.findByProgramId(
    programId,
    safePage,
    safeLimit
  );

  const playlistsWithDuration = await Promise.all(
    data.playlists.map(async (p) => {
      const totalDuration =
        await PlaylistRepository.getTotalDuration(p.id);

      return {
        ...p,
        totalDuration,
      };
    })
  );

  return {
    ...data,
    playlists: playlistsWithDuration,
  };
},

  // GET SINGLE PLAYLIST
getPlaylistById: async (playlistId: number) => {
  if (!playlistId || isNaN(playlistId)) {
    throw new Error("Invalid playlistId");
  }

  const playlist = await PlaylistRepository.findById(playlistId);

  if (!playlist) return null;

  const totalSeconds =
    await PlaylistRepository.getTotalDuration(playlistId);

  return {
    ...playlist,
    totalDuration: totalSeconds,
  };
},

  // UPDATE
  updatePlaylist: async (
    id: number,
    data: { name: string }
  ) => {
    if (!id || isNaN(id)) {
      throw new Error("Invalid playlist id");
    }

    if (!data.name || data.name.trim() === "") {
      throw new Error("Playlist name is required");
    }

    return PlaylistRepository.update(id, data);
  },

  // DELETE
  deletePlaylist: async (id: number) => {
    if (!id || isNaN(id)) {
      throw new Error("Invalid playlist id");
    }

    return PlaylistRepository.delete(id);
  },

};
