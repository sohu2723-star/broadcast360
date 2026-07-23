import PlaylistItemForm from "@/components/admin/playlist-items/PlaylistItemForm";

interface Props {
  params: Promise<{
    programId: string;
    playlistId: string;
  }>;
}

export default async function CreatePlaylistItemPage({ params }: Props) {
  const { programId, playlistId } = await params;

  const playlistIdNumber = Number(playlistId);

  if (isNaN(playlistIdNumber)) {
    throw new Error("Invalid playlist id");
  }

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold text-white">Add Playlist Item</h1>

      <PlaylistItemForm
        programId={Number(programId)}
        playlistId={playlistIdNumber}
      />
    </div>
  );
}
