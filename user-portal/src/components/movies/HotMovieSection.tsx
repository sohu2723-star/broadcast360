import type { Movie } from "@/types/movie";
import MovieCard from "./MovieCard";

interface Props {
  movies: Movie[];
}

export default function HotMovieSection({ movies }: Props) {
  const latestMovies = [...movies]
    .sort((a, b) => {
      const dateA = new Date(a.scheduleEnd ?? "").getTime();

      const dateB = new Date(b.scheduleEnd ?? "").getTime();

      return dateB - dateA;
    })
    .slice(0, 5);

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {latestMovies.map((movie) => (
        <MovieCard key={`${movie.id}-${movie.movieKey}`} movie={movie} />
      ))}
    </div>
  );
}
