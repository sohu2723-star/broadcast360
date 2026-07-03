import {
  getSeriesById,
  getPaginatedSeries,
  deleteSeries,
} from "@/repositories/series.repository";

/**
 * Get single series by ID
 */
export function fetchSeriesById(
  id: number,
  opts?: { skip: number; take: number }
) {
  return getSeriesById(id, opts);
}

/**
 * Get paginated series list
 */
export async function fetchPaginatedSeries(
  page: number,
  limit: number,
  search?: string
) {
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

/**
 * Delete series
 */
export function removeSeries(id: number) {
  return deleteSeries(id);
}