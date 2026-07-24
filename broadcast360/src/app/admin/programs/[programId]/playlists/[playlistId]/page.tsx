import PlaylistItemList from "@/components/admin/playlist-items/PlaylistItemList";
import PlaylistInfoCard from "@/components/admin/playlists/PlaylistInfoCard";
import { Series } from "@/generated/prisma/edge";

async function getPlaylist(programId: number, playlistId: number) {
  const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";

  const res = await fetch(
    `${baseUrl}/api/programs/${programId}/playlists/${playlistId}`,
    { cache: "no-store" },
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to load playlist");
  }

  return data;
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

  const data = await getPlaylist(programIdNumber, playlistIdNumber);

  const playlist = data.data;

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
