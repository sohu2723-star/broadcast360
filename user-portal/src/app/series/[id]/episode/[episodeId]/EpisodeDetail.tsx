"use client";

import { useState } from "react";

import SeriesPlayer from "@/components/series/player/SeriesPlayer";
import SeriesSidebar from "@/components/series/SeriesSidebar";
import RelatedSeries from "@/components/series/RelatedSeries";
import type { SeriesDetail } from "@/types/series-details";
import type { Series } from "@/types/series";

interface Props {
  series: SeriesDetail;
  episodeId: number;
  relatedSeries: Series[];
}

export default function EpisodeDetail({
  series,
  episodeId,
  relatedSeries,
}: Props) {
  const initialEpisode =
    series.episodes.find((episode) => episode.id === episodeId) ??
    series.latestEpisode;

  const [currentEpisode, setCurrentEpisode] = useState(initialEpisode);
  const [currentPartIndex, setCurrentPartIndex] = useState(0);

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid grid-cols-12 gap-6 items-stretch">
          <div className="col-span-12 lg:col-span-8">
            <SeriesPlayer
              episodes={series.episodes}
              currentEpisode={currentEpisode}
              currentPartIndex={currentPartIndex}
              onEpisodeChange={setCurrentEpisode}
              onPartChange={setCurrentPartIndex}
            />
          </div>
          <div className="col-span-12 lg:col-span-4">
            <SeriesSidebar
              episodes={series.episodes}
              currentEpisode={currentEpisode}
              currentPartIndex={currentPartIndex}
              onEpisodeChange={setCurrentEpisode}
              onPartChange={setCurrentPartIndex}
            />
          </div>
        </div>

        <div className="mt-12">
          <RelatedSeries
            series={relatedSeries.map((item) => ({
              ...item,
              description: item.description ?? null,
            }))}
          />
        </div>
      </div>
    </main>
  );
}
