"use client";

import type { Episode } from "@/types/series-details";
import EpisodeItem from "./EpisodeItem";

interface Props {
  episodes: Episode[];
  currentEpisode: Episode;
  onSelect: (episode: Episode) => void;
}

export default function EpisodeList({
  episodes,
  currentEpisode,
  onSelect,
}: Props) {
  if (episodes.length === 0) {
    return (
      <div className="rounded-xl bg-zinc-900 p-6 text-center text-gray-400">
        No episodes available.
      </div>
    );
  }

  return (
    <section className="mt-8">
      <h2 className="mb-5 text-2xl font-bold text-white">Episodes</h2>

      <div className="space-y-4">
        {episodes.map((episode) => (
          <EpisodeItem
            key={episode.id}
            episode={episode}
            active={currentEpisode.id === episode.id}
            onSelect={onSelect}
          />
        ))}
      </div>
    </section>
  );
}
