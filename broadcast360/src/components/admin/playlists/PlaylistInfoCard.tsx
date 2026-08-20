import Link from "next/link";

interface Props {
  channelName: string;
  programName: string;
  playlistName: string;
  duration: number | null;
  programId: number;
  playlistId: number;
}

function formatDuration(seconds: number | null) {
  if (!seconds) return "00:00:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
}

export default function PlaylistInfoCard({
  channelName,
  programName,
  playlistName,
  duration,
  programId,
  playlistId,
}: Props) {
  return (
    <div className="space-y-6 rounded-2xl border border-[#1A2148] bg-[#0B1026] p-6 text-white shadow-lg">
      {/* TOP */}

      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-400">Channel</p>

          <h2 className="mt-1 text-xl font-semibold">{channelName}</h2>

          <div className="mt-4 flex items-center gap-2 text-gray-400">
            <span>Program</span>

            <span className="text-white">/</span>

            <span className="text-[#4f6689]">{programName}</span>
          </div>
        </div>

        <div className="flex gap-3">
          <Link
            href={`/admin/programs/${programId}/playlists/${playlistId}/items/create`}

            className="rounded-xl bg-[#4f6689] px-5 py-3 transition hover:opacity-90"
          >
            + Add Item
          </Link>
        </div>
      </div>

      {/* PLAYLIST TITLE */}

      <div className="flex items-center justify-between rounded-xl bg-[#010312] p-5">
        <div>
          <p className="text-sm text-gray-400">Playlist</p>

          <h1 className="mt-2 text-3xl font-bold">{playlistName}</h1>
        </div>

        <div className="text-right">
          <p className="text-sm text-gray-400">Total Duration</p>

          <div className="mt-2 text-3xl font-bold text-[#1CFE10]">
            {formatDuration(duration)}
          </div>
        </div>
      </div>
    </div>
  );
}
