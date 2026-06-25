import {
  getAllMovies,
  getMovieById,
} from "@/repositories/movie.repository";

export function fetchMovies() {
  return getAllMovies();
}

export function fetchMovieById(id: number) {
  return getMovieById(id);
}