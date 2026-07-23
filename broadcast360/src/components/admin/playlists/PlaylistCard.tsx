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

export default function PlaylistCard({ playlist, programId }: Props) {
  const router = useRouter();

  function formatDuration(seconds: number | null) {
    if (!seconds) return "00:00:00";

    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;

    return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      "Are you sure you want to delete this playlist?",
    );

    if (!confirmed) return;

    const res = await fetch(
      `/api/programs/${programId}/playlists/${playlist.id}`,
      {
        method: "DELETE",
      },
    );

    if (!res.ok) {
      alert("Failed to delete playlist");
      return;
    }

    router.refresh();
  }

  return (
    <div className="flex items-center justify-between rounded-xl border border-[#1a2140] bg-[#0B1026] p-5">
      <div>
        <h3 className="text-lg font-bold text-white">{playlist.name}</h3>

        <p className="mt-2 text-sm text-gray-400">
          Duration: {formatDuration(playlist.totalDuration)}
        </p>
      </div>

      <div className="flex gap-3">
        <Link
          href={`/admin/programs/${programId}/playlists/${playlist.id}`}
          className="rounded-lg bg-[#106EE9] px-4 py-2 text-sm text-white"
        >
          View
        </Link>

        <Link
          href={`/admin/programs/${programId}/playlists/${playlist.id}/edit`}
          className="rounded-lg bg-[#400FD3] px-4 py-2 text-sm text-white"
        >
          Edit
        </Link>

        <button
          onClick={handleDelete}
          className="rounded-lg bg-[#F41010] px-4 py-2 text-sm text-white"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
