"use client";

import type { Episode } from "@/types/series-details";

interface Props {
  episodes: Episode[];

  currentEpisode: Episode;

  onSelectEpisode: (episode: Episode) => void;
}

export default function OtherEpisodesTab({
  episodes,
  currentEpisode,
  onSelectEpisode,
}: Props) {
  return (
    <div className="space-y-3 p-4 max-h-[400px] overflow-y-auto">
      {episodes.map((episode) => (
        <button
          key={episode.episodeNo}
          onClick={() => onSelectEpisode(episode)}
          className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition ${
            currentEpisode.episodeNo === episode.episodeNo
              ? "border-blue-500 bg-blue-600/20"
              : "border-zinc-700 bg-zinc-800 hover:bg-zinc-700"
          }`}
        >
          <img
            src={episode.parts[0]?.thumbnail ?? "/images/no-image.png"}
            alt={episode.title}
            className="h-16 w-28 rounded object-cover"
          />

          <div className="flex-1">
            <h3 className="font-semibold">Episode {episode.episodeNo}</h3>

            <p className="text-sm text-zinc-400">
              {episode.parts.length} Parts
            </p>

            <p className="text-xs text-zinc-500">{episode.channel.name}</p>
          </div>
        </button>
      ))}
    </div>
  );
}
