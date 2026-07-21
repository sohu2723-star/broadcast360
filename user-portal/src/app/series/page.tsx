import SeriesContent from "@/components/series/SeriesContent";

import { SeriesService } from "@/services/series.service";

interface Props {
  searchParams: Promise<{
    search?: string;
    channelId?: string;
    page?: string;
  }>;
}

export default async function SeriesPage({ searchParams }: Props) {
  const params = await searchParams;

  const search = params.search || "";

  const channelId = params.channelId ? Number(params.channelId) : undefined;

  const page = Number(params.page || 1);

  // All Series
  const seriesResponse = await SeriesService.getSeries({
    page,

    limit: 20,

    search,

    channelId,

    type: "all",
  });

  return (
    <main className="min-h-screen bg-black px-6 py-10">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-8 text-4xl font-bold text-white">TV Series</h1>

        <SeriesContent
          series={seriesResponse.series}
          page={seriesResponse.pagination.page}
          totalPages={seriesResponse.pagination.totalPages}
          search={search}
          channelId={channelId}
        />
      </div>
    </main>
  );
}
