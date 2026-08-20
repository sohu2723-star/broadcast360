import PlaylistItemList from "@/components/admin/playlist-items/PlaylistItemList";
import PlaylistInfoCard from "@/components/admin/playlists/PlaylistInfoCard";
import { PlaylistService } from "@/services/playlist.service";

async function getPlaylist(programId: number, playlistId: number) {
  const playlist = await PlaylistService.getPlaylistById(playlistId);

  if (!playlist || playlist.program.id !== programId) {
    throw new Error("Playlist not found");
  }

  return playlist;
}

interface Props {
  params: {
    programId: string;
    playlistId: string;
  };
}

export default async function PlaylistPage({
  params,
}: {
  params: Promise<{ programId: string; playlistId: string }>;
}) {
  const { programId, playlistId } = await params;

  const programIdNumber = Number(programId);
  const playlistIdNumber = Number(playlistId);

  if (isNaN(programIdNumber) || isNaN(playlistIdNumber)) {
    throw new Error("Invalid id");
  }

  const playlist = await getPlaylist(programIdNumber, playlistIdNumber);

  return (
    <div className="min-h-screen bg-[#010312] p-8">
      <PlaylistInfoCard
        channelName={playlist.program.channel.name}
        programName={playlist.program.title}
        playlistName={playlist.name}
        duration={playlist.totalDuration}
        programId={playlist.program.id}
        playlistId={playlist.id}
      />

      <PlaylistItemList
        items={playlist.items ?? []}
        programId={programIdNumber}
        playlistId={playlistIdNumber}
      />
    </div>
  );
}
