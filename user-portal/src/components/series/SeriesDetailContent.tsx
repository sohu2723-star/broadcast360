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
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Series Information */}
        <section className="mb-10">
          <SeriesInfo series={series} />
        </section>

        {/* Other Episodes */}
        <section className="mb-12">
          <OtherEpisodes
            seriesId={series.id}
            episodes={series.episodes}
            currentEpisode={currentEpisode}
          />
        </section>

        {/* Related Series */}
        <section>
          <RelatedSeries
            series={relatedSeries.map((item) => ({
              ...item,
              description: item.description ?? null,
            }))}
          />
        </section>
      </div>
    </main>
  );
}
