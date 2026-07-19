"use client";

import Image from "next/image";

import type { Episode } from "@/types/series-details";

interface Props {
  episodes: Episode[];
  currentEpisode: Episode;
  onSelect: (episode: Episode) => void;
}

export default function OtherEpisodes({
  episodes,
  currentEpisode,
  onSelect,
}: Props) {
  const sortedEpisodes = [...episodes].sort(
    (a, b) => b.episodeNo - a.episodeNo,
  );

  return (
    <section className="mt-12">
      <h2 className="mb-6 text-2xl font-bold text-white">Playlists</h2>

      <div className="grid grid-cols-2 gap-6 lg:grid-cols-4 xl:grid-cols-4">
        {sortedEpisodes.map((episode) => (
          <button
            key={episode.id}
            onClick={() => onSelect(episode)}
            className={`overflow-hidden rounded-xl bg-zinc-900 text-left transition hover:bg-zinc-800 ${
              currentEpisode.id === episode.id ? "ring-2 ring-blue-500" : ""
            }`}
          >
            <div className="relative aspect-video">
              <Image
                src={episode.parts[0]?.thumbnail || "/images/no-image.png"}
                alt={episode.title}
                fill
                className="object-cover"
                unoptimized
              />
            </div>

            <div className="p-4">
              <h3 className="font-semibold">EP.{episode.episodeNo}</h3>
              <p className="mt-1 text-sm text-gray-400">{episode.title}</p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
