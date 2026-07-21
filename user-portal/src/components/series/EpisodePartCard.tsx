"use client";

interface Props {
  partNo: number;
  active?: boolean;
  onClick: () => void;
}

export default function EpisodePartCard({ partNo, active, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className={`w-full rounded-lg px-4 py-3 text-left transition
      ${
        active
          ? "bg-blue-600 text-white"
          : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
      }`}
    >
      Part {partNo}
    </button>
  );
}
