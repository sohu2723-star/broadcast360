"use client";

import { useState } from "react";

import SeriesPlayer from "./player/SeriesPlayer";
import SeriesSidebar from "./SeriesSidebar";
import SeriesInfo from "./SeriesInfo";
import RelatedSeries from "./RelatedSeries";
import OtherEpisodes from "./OtherEpisodes";
import type { SeriesDetail } from "@/types/series-details";
import type { Series } from "@/types/series";

interface Props {
  series: SeriesDetail;
  relatedSeries: Series[];
}

export default function SeriesDetailContent({ series, relatedSeries }: Props) {
  const [currentEpisode, setCurrentEpisode] = useState(series.latestEpisode);

  const [currentPartIndex, setCurrentPartIndex] = useState(0);

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid grid-cols-12 gap-6">
          <SeriesPlayer
            episodes={series.episodes}
            currentEpisode={currentEpisode}
            currentPartIndex={currentPartIndex}
            onEpisodeChange={setCurrentEpisode}
            onPartChange={setCurrentPartIndex}
          />

          <SeriesSidebar
            episodes={series.episodes}
            currentEpisode={currentEpisode}
            currentPartIndex={currentPartIndex}
            onEpisodeChange={setCurrentEpisode}
            onPartChange={setCurrentPartIndex}
          />
        </div>

        <div className="mt-8">
          <SeriesInfo series={series} />
        </div>

        {/* <OtherEpisodes
          episodes={series.episodes}
          currentEpisode={currentEpisode}
          onSelect={(episode) => {
            setCurrentEpisode(episode);
            setCurrentPartIndex(0);
            window.scrollTo({
              top: 0,
              behavior: "smooth",
            });
          }}
        /> */}

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
