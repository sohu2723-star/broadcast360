"use client";

import type { Episode } from "@/types/series-details";

interface Props {
  episode: Episode;

  currentPartIndex: number;

  onSelectPart: (index: number) => void;
}

export default function CurrentEpisodeTab({
  episode,
  currentPartIndex,
  onSelectPart,
}: Props) {
  return (
    <div className="space-y-3 p-4 max-h-[400px] overflow-y-auto">
      <div>
        <h2 className="text-lg font-bold">Episode {episode.episodeNo}</h2>

        <p className="text-sm text-zinc-400">{episode.parts.length} Parts</p>
      </div>

      <div className="space-y-3">
        {episode.parts.map((part, index) => (
          <button
            key={part.id}
            onClick={() => onSelectPart(index)}
            className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition ${
              currentPartIndex === index
                ? "border-blue-500 bg-blue-600/20"
                : "border-zinc-700 bg-zinc-800 hover:bg-zinc-700"
            }`}
          >
            <img
              src={part.thumbnail ?? "/images/no-image.png"}
              alt={part.title}
              className="h-16 w-28 rounded object-cover"
            />

            <div className="flex-1">
              <h3 className="font-semibold">Part {index + 1}</h3>

              <p className="text-sm text-zinc-400">{part.title}</p>

              <p className="text-xs text-zinc-500">
                {Math.floor(part.duration / 60)} min
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
