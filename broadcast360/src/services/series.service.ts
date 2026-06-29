import { getSeriesById } from "@/repositories/series.repository";

export function fetchSeriesById(
  id: number,
  opts?: { skip: number; take: number }
) {
  return getSeriesById(id, opts);
}