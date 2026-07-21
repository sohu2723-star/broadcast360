import type { Movie } from "@/types/movie";
import MovieCard from "./MovieCard";

interface Props {
  movies: Movie[];
}

export default function HotMovieSection({ movies }: Props) {
  const latestMovies = [...movies]
    .sort((a, b) => {
      const dateA = new Date(
        a.scheduleEnd ?? a.createdAt ?? ""
      ).getTime();

      const dateB = new Date(
        b.scheduleEnd ?? b.createdAt ?? ""
      ).getTime();

      return dateB - dateA;
    })
    .slice(0, 5);


  return (
    <div
      className=" grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-7">
      {latestMovies.map((movie, index) => (
        <MovieCard
          key={`${movie.id}-${index}`}
          movie={movie}
        />
      ))}
    </div>
  );
}