import api from "@/lib/api";

import type { Movie } from "@/types/movie";

export async function getMovies(): Promise<Movie[]> {
  try {
    const response = await api.get("/api/user-portal/movies");

    return response.data.movies ?? [];
  } catch (error) {
    console.error("Failed to fetch movies:", error);

    return [];
  }
}

export async function getMovieById(id: string): Promise<Movie> {
  try {
    const response = await api.get(`/api/user-portal/movies/${id}`);

    return response.data.movie;
  } catch (error) {
    console.error("Failed to fetch movie:", error);

    throw error;
  }
}
