import { getSeriesById } from "@/repositories/series.repository";

export function fetchSeriesById(id: number) {
  return getSeriesById(id);
}