import Link from "next/link";
import PlaylistCard from "./PlaylistCard";

interface Playlist {
  id: number;
  name: string;
  totalDuration: number | null;
}

interface Props {
  playlists: Playlist[];
  programId: number;
  page: number;
  totalPages: number;
}

export default function PlaylistList({
  playlists,
  programId,
  page,
  totalPages,
}: Props) {
  return (
    <div className="space-y-4">

      {/* EMPTY STATE */}
      {playlists.length === 0 ? (
        <div className="text-gray-400 text-center py-10">
          No playlists found
        </div>
      ) : (
        <div className="grid gap-3">
          {playlists.map((playlist) => (
            <div
              key={playlist.id}
              className="bg-[#111936] border border-white/10 rounded-lg p-4 hover:border-blue-500/50 transition"
            >
              <PlaylistCard
                playlist={playlist}
                programId={programId}
              />
            </div>
          ))}
        </div>
      )}

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center pt-4 border-t border-white/10">
          
          <Link
            href={`?page=${page - 1}`}
            className={`px-4 py-2 rounded-lg ${
              page <= 1
                ? "bg-gray-800 text-gray-500 pointer-events-none"
                : "bg-gray-700 text-white"
            }`}
          >
            Previous
          </Link>

          <span className="text-gray-300">
            Page {page} / {totalPages}
          </span>

          <Link
            href={`?page=${page + 1}`}
            className={`px-4 py-2 rounded-lg ${
              page >= totalPages
                ? "bg-gray-800 text-gray-500 pointer-events-none"
                : "bg-blue-600 text-white"
            }`}
          >
            Next
          </Link>
        </div>
      )}
    </div>
  );
}