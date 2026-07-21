import Link from "next/link";
import Image from "next/image";

import type { Movie } from "@/types/movie";

interface Props {
  movie: Movie;
}

function formatDuration(seconds: number) {
  if (!seconds || seconds <= 0) {
    return "-";
  }

  const hours = Math.floor(seconds / 3600);

  const minutes = Math.floor((seconds % 3600) / 60);

  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${remainingSeconds}s`;
  }

  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  }

  return `${remainingSeconds}s`;
}

export default function MovieCard({ movie }: Props) {
  return (
    <Link
      href={`/movies/${movie.movieKey}`}
      className="group relative block h-[380px] w-[250px] flex-shrink-0 overflow-hidden rounded-xl bg-zinc-900"
    >
      <Image
        src={movie.thumbnail || "/images/no-image.png"}
        alt={movie.title}
        fill
        className="object-cover transition duration-300 group-hover:scale-110"
        unoptimized
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

      <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
        <h3 className="mb-3 line-clamp-1 text-lg font-bold">{movie.title}</h3>

        <p className="mb-2 text-xs text-gray-300">
          📺 {movie.channelName || "Broadcast360"}
        </p>

        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
          <span>🎭 {movie.genre || "Movie"}</span>

          <span>🎬 {movie.releaseYear ?? "-"}</span>

          <span>⏱ {formatDuration(movie.duration)}</span>
        </div>
      </div>
    </Link>
  );
}
