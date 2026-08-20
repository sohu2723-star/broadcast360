import PlaylistItemList from "@/components/admin/playlist-items/PlaylistItemList";
import Link from "next/link";
import { PlaylistService } from "@/services/playlist.service";

interface Props {
  params: Promise<{
    programId: string;
    playlistId: string;
  }>;
}

export default async function PlaylistPage({ params }: Props) {
  const { programId, playlistId } = await params;

  const playlistIdNumber = Number(playlistId);

  const playlist = await PlaylistService.getPlaylistById(playlistIdNumber);

  if (!playlist) {
    throw new Error("Playlist not found");
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}

      <div className="rounded-xl bg-[#0B1026] p-6">
        <h1 className="text-2xl font-bold text-white">{playlist.name}</h1>

        <p className="mt-2 text-gray-400">
          Duration:
          {playlist.totalDuration ?? 0}
        </p>

        <Link
          href={`/admin/programs/${programId}/playlists/${playlistId}/items/create`}

          className="mt-5 inline-block rounded-lg bg-[#4f6689] px-5 py-3 text-white"
        >
          + Add Playlist Item
        </Link>
      </div>

      <PlaylistItemList
        items={playlist.items ?? []}
        programId={Number(programId)}
        playlistId={Number(playlistId)}
      />
    </div>
  );
}
