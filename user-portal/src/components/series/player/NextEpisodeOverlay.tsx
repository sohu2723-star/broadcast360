"use client";

import type { Episode } from "@/types/series-details";

interface Props {
  episode: Episode;
  seconds: number;
  onPlayNow: () => void;
  onCancel: () => void;
}

export default function NextEpisodeOverlay({
  episode,
  seconds,
  onPlayNow,
  onCancel,
}: Props) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/80">
      <div className="w-[420px] rounded-xl bg-zinc-900 p-8 text-center">
        <p className="text-gray-400">Up Next</p>

        <h2 className="mt-3 text-3xl font-bold text-white">
          Episode {episode.episodeNo}
        </h2>

        <p className="mt-2 text-gray-300">{episode.title}</p>

        <p className="mt-6 text-xl text-blue-500">Playing in {seconds}s</p>

        <div className="mt-8 flex justify-center gap-4">
          <button
            onClick={onPlayNow}
            className="rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
          >
            Play Now
          </button>

          <button
            onClick={onCancel}
            className="rounded-lg bg-zinc-700 px-6 py-3 text-white hover:bg-zinc-600"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
