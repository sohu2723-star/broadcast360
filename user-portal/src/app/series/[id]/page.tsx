import { notFound } from "next/navigation";

import { SeriesService } from "@/services/series.service";

import SeriesInfo from "@/components/series/SeriesInfo";
import SeriesPlayer from "@/components/series/player/SeriesPlayer";
import RelatedSeries from "@/components/series/RelatedSeries";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function SeriesDetailPage({ params }: Props) {
  const { id } = await params;

  const seriesId = Number(id);

  if (isNaN(seriesId)) {
    notFound();
  }

  try {
    const [series, relatedSeries] = await Promise.all([
      SeriesService.getSeriesById(seriesId),

      SeriesService.getRelatedSeries(seriesId),
    ]);

    return (
      <main className="min-h-screen bg-black">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <SeriesInfo series={series} />

          <SeriesPlayer episodes={series.episodes} />

          <RelatedSeries series={relatedSeries} />
        </div>
      </main>
    );
  } catch (error) {
    console.error("Series Detail Page Error:", error);

    notFound();
  }
}
