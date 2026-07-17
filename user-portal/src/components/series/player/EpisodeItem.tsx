"use client";

import Image from "next/image";
import type { Episode } from "@/types/series-details";

interface Props {
  episode: Episode;
  active: boolean;
  onSelect: (episode: Episode) => void;
}

export default function EpisodeItem({ episode, active, onSelect }: Props) {
  return (
    <button
      onClick={() => onSelect(episode)}
      className={`group flex w-full overflow-hidden rounded-xl border transition-all ${
        active
          ? "border-red-600 bg-red-600/10"
          : "border-zinc-800 bg-zinc-900 hover:border-zinc-700 hover:bg-zinc-800"
      }`}
    >
      {/* Thumbnail */}

      <div className="relative h-28 w-44 flex-shrink-0">
        <Image
          src={episode.thumbnail || "/images/no-image.png"}
          alt={episode.title}
          fill
          className="object-cover transition duration-300 group-hover:scale-105"
          unoptimized
        />
      </div>

      {/* Content */}

      <div className="flex flex-1 items-center justify-between p-4">
        <div className="text-left">
          <h3 className="text-lg font-semibold text-white">
            Episode {episode.episodeNo}
          </h3>

          <p className="mt-1 text-gray-300">{episode.title}</p>

          <p className="mt-2 text-sm text-gray-500">
            {Math.ceil(episode.duration / 60)} min
          </p>
        </div>

        <div className="flex items-center">
          {active ? (
            <div className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white">
              Playing
            </div>
          ) : (
            <div className="text-4xl text-white transition group-hover:text-red-500">
              ▶
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
