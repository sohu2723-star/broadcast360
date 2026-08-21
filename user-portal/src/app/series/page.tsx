import SeriesContent from "@/components/series/SeriesContent";

import { SeriesService } from "@/services/series.service";
import type { SeriesResponse } from "@/types/series";

interface Props {
  searchParams: Promise<{
    search?: string;
    page?: string;
  }>;
}

export default async function SeriesPage({ searchParams }: Props) {
  const params = await searchParams;

  const search = params.search || "";

  const page = Number(params.page || 1);

  let seriesResponse: SeriesResponse = {
    success: true,
    series: [],
    pagination: { page, limit: 20, total: 0, totalPages: 0 },
  };

  try {
    seriesResponse = await SeriesService.getSeries({
      page,
      limit: 20,
      search,
      type: "all",
    });
  } catch (error) {
    console.error("Series page data load failed:", error);
  }

  return (
    <main className="min-h-screen bg-[#121212] px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-8 text-4xl font-bold text-white">TV Series</h1>

        {seriesResponse.series.length === 0 ? (
          <div className="mb-8 rounded-2xl border border-white/10 bg-[#1f1f1f]/80 px-5 py-8 text-center text-sm text-white/70">
            Series data is temporarily unavailable. Please refresh in a moment.
          </div>
        ) : null}

        <SeriesContent
          series={seriesResponse.series}
          page={seriesResponse.pagination.page}
          totalPages={seriesResponse.pagination.totalPages}
          search={search}
        />
      </div>
    </main>
  );
}
