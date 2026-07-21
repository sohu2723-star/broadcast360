import EpisodeDetail from "./EpisodeDetail";
import { SeriesService } from "@/services/series.service";

interface Props {
  params: Promise<{
    id: string;
    episodeId: string;
  }>;
}

export default async function Page({ params }: Props) {
  const { id, episodeId } = await params;

  const series = await SeriesService.getSeriesById(Number(id));

  const relatedSeries = await SeriesService.getRelatedSeries(Number(id));

  return (
    <EpisodeDetail
      series={series}
      episodeId={Number(episodeId)}
      relatedSeries={relatedSeries}
    />
  );
}
