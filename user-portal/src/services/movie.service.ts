import api from "@/lib/api";

import type { Movie } from "@/types/movie";

export async function getMovies(): Promise<Movie[]> {
  const response = await api.get("/api/user-portal/movies");

  return response.data.movies ?? [];
}

export async function getMovieDetail(id: string) {
  const response = await api.get(`/api/user-portal/movies/${id}`);

  return response.data;
}

export async function getMovieByPlaylistItem(
  id: number,
): Promise<Movie | null> {
  try {
    const res = await api.get(`/api/user-portal/movies/watch/${id}`);

    return res.data.movie;
  } catch (error) {
    console.error(error);

    return null;
  }
}

export async function getWatchMovie(id: string) {
  const response = await api.get(`/api/user-portal/movies/watch/${id}`);

  return response.data;
}
