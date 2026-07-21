"use client";

interface Props {
  episodeNo: number;
  active?: boolean;
  onClick: () => void;
}

export default function EpisodeCard({ episodeNo, active, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className={`w-full rounded-lg p-4 text-left transition
      ${
        active
          ? "bg-blue-600 text-white"
          : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
      }`}
    >
      Episode {episodeNo}
    </button>
  );
}
