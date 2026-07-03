import PlaylistItemList from "@/components/admin/playlist-items/PlaylistItemList";
import PlaylistInfoCard from "@/components/admin/playlists/PlaylistInfoCard";

async function getPlaylist(programId: number, playlistId: number) {
  const res = await fetch(
    `http://localhost:3000/api/programs/${programId}/playlists/${playlistId}`,
    {
      cache: "no-store",
    },
  );

  const data = await res.json();

  if (!res.ok) {
    console.error(data);

    throw new Error(data.message || "Failed to load playlist");
  }

  return data;
}

interface Props {
    params: Promise<{
    programId: string;
    playlistId: string;
  }>;
}

export default async function PlaylistPage({ params }: Props) {
  const { programId, playlistId } = await params;

  const programIdNumber = Number(programId);

  const playlistIdNumber = Number(playlistId);

  if (isNaN(programIdNumber) || isNaN(playlistIdNumber)) {
    throw new Error("Invalid id");
  }

  const data = await getPlaylist(programIdNumber, playlistIdNumber);

  const playlist = data.data;

  return (
    <div className="p-8 bg-[#010312] min-h-screen">
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
        programId={Number(programId)}
        playlistId={Number(playlistId)}
      />
    </div>
  );
}
