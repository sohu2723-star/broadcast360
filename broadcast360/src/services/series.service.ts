import { getPaginatedSeries, deleteSeries } from "@/repositories/series.repository";

export async function fetchPaginatedSeries(page: number, limit: number, search?: string) {
  const validatedPage = Math.max(1, page);
  const validatedLimit = Math.max(1, limit);

  const { data, total } = await getPaginatedSeries({
    page: validatedPage,
    limit: validatedLimit,
    search,
  });

  return {
    data,
    pagination: {
      page: validatedPage,
      limit: validatedLimit,
      total,
    },
  };
}

export function removeSeries(id: number) {
  return deleteSeries(id);
}