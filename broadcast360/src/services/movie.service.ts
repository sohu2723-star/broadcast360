import {getPaginatedMovies,getMovieById, deleteMovie} from "@/repositories/movie.repository";

export async function fetchPaginatedMovies(page: number, limit: number) {

  const validatedPage = Math.max(1, page);
  const validatedLimit = Math.max(1, limit);

  const { data, total } = await getPaginatedMovies({ 
    page: validatedPage, 
    limit: validatedLimit 
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

export function fetchMovieById(id: number) {
  return getMovieById(id);
}

export function removeMovie(id: number) {
  return deleteMovie(id);
}