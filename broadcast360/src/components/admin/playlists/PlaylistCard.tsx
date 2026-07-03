"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

interface Props {
  playlist: {
    id: number;
    name: string;
    totalDuration: number | null;
  };

  programId: number;
}

export default function PlaylistCard({
  playlist,
  programId,
}: Props) {
  const router = useRouter();

  function formatDuration(seconds: number | null) {
  if (!seconds) return "00:00:00";

  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  return [h, m, s].map(v => String(v).padStart(2, "0")).join(":");
}

  async function handleDelete() {
    const confirmed = window.confirm(
      "Are you sure you want to delete this playlist?"
    );

    if (!confirmed) return;

    const res = await fetch(`/api/programs/${programId}/playlists/${playlist.id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      alert("Failed to delete playlist");
      return;
    }

    router.refresh();
  }

  return (
    <div
      className="
        bg-[#0B1026]
        border
        border-[#1a2140]
        rounded-xl
        p-5
        flex
        justify-between
        items-center
      "
    >
      <div>
        <h3 className="text-white font-bold text-lg">
          {playlist.name}
        </h3>

        <p className="text-gray-400 text-sm mt-2">
          Duration: {formatDuration(playlist.totalDuration)}
        </p>
      </div>

      <div className="flex gap-3">
        <Link
          href={`/admin/programs/${programId}/playlists/${playlist.id}`}
          className="bg-[#106EE9] px-4 py-2 rounded-lg text-white text-sm"
        >
          View
        </Link>

        <Link
          href={`/admin/programs/${programId}/playlists/${playlist.id}/edit`}
          className="bg-[#400FD3] px-4 py-2 rounded-lg text-white text-sm"
        >
          Edit
        </Link>

        <button
          onClick={handleDelete}
          className="bg-[#F41010] px-4 py-2 rounded-lg text-white text-sm"
        >
          Delete
        </button>
      </div>
    </div>
  );
}