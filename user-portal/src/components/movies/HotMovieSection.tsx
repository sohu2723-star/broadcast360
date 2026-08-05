import type { Movie } from "@/types/movie";
import MovieCard from "./MovieCard";

interface Props {
  movies: Movie[];
}

export default function HotMovieSection({ movies }: Props) {
  const hotMovies = [...movies]
    .map((movie) => ({
      ...movie,
      views: Math.floor(Math.random() * 10000),
    }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 8);

  return (
   <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {hotMovies.map((movie) => (
        <MovieCard key={`${movie.id}-${movie.movieKey}`} movie={movie} />
      ))}
    </div>
  );
}