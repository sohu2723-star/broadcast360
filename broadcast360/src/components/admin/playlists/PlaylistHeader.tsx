"use client";

import Link from "next/link";

interface Props {
  programId: number;
}

export default function PlaylistHeader({ programId }: Props) {
  return (
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-xl font-bold">Playlists</h2>

      <Link
        href={`/admin/programs/${programId}/playlists/create`}
        className="bg-[#4f6689] text-white px-4 py-2 rounded-lg"
      >
        + Create Playlist
      </Link>
    </div>
  );
}