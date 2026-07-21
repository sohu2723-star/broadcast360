"use client";

import { useState } from "react";

import CurrentEpisodeTab from "./CurrentEpisodeTab";
import OtherEpisodesTab from "./OtherEpisodesTab";

import type { Episode } from "@/types/series-details";

interface Props {
  episodes: Episode[];

  currentEpisode: Episode;

  currentPartIndex: number;

  onEpisodeChange: (episode: Episode) => void;

  onPartChange: (index: number) => void;
}

export default function SeriesSidebar({
  episodes,
  currentEpisode,
  currentPartIndex,
  onEpisodeChange,
  onPartChange,
}: Props) {
  const [tab, setTab] = useState<"current" | "episodes">("current");

  return (
    <aside className="col-span-4 rounded-xl bg-zinc-900 overflow-hidden">
      <div className="grid grid-cols-2">
        <button
          onClick={() => setTab("current")}
          className={`py-4 text-sm font-semibold ${
            tab === "current"
              ? "bg-blue-600 text-white"
              : "bg-zinc-800 text-zinc-400"
          }`}
        >
          Current Episode
        </button>

        <button
          onClick={() => setTab("episodes")}
          className={`py-4 text-sm font-semibold ${
            tab === "episodes"
              ? "bg-blue-600 text-white"
              : "bg-zinc-800 text-zinc-400"
          }`}
        >
          Other Episodes
        </button>
      </div>

      <div className="max-h-[650px] overflow-y-auto">
        {tab === "current" ? (
          <CurrentEpisodeTab
            episode={currentEpisode}
            currentPartIndex={currentPartIndex}
            onSelectPart={onPartChange}
          />
        ) : (
          <OtherEpisodesTab
            episodes={episodes}
            currentEpisode={currentEpisode}
            onSelectEpisode={(episode) => {
              onEpisodeChange(episode);
              onPartChange(0);
            }}
          />
        )}
      </div>
    </aside>
  );
}
