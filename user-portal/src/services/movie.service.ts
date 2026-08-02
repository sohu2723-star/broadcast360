import api from "@/lib/api";

import type { Movie } from "@/types/movie";

export async function getMovies(): Promise<Movie[]> {
  const response = await api.get("/api/user-portal/movies");

  return response.data.movies ?? [];
}

export async function getWatchMovie(id: string) {
  const response = await api.get(
    `/api/user-portal/movies/watch/${id}`,
  );

  return response.data;
}