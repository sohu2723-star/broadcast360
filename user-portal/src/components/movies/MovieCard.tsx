import Link from "next/link";
import Image from "next/image";

import type { Movie } from "@/types/movie";

interface Props {
  movie: Movie;
}

export default function MovieCard({ movie }: Props) {
  return (
    <Link
      href={`/movies/watch/${movie.playlistId}`}
      className="group relative block h-[380px] w-[250px] overflow-hidden rounded-xl bg-zinc-900 transition hover:scale-105"
    >
      <Image
        src={movie.thumbnail || "/images/no-image.png"}
        alt={movie.playlistName || movie.title}
        fill
        sizes="250px"
        className="object-cover transition duration-500 group-hover:scale-110"
        unoptimized
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
        <h3 className="line-clamp-1 text-lg font-bold">
          {movie.playlistName || movie.title}
        </h3>

        <p className="mt-2 text-xs text-gray-300">
           {movie.channelName || "-"}
        </p>

        <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-400">
          <span> {movie.genre || "Movie"}</span>

          <span> {movie.releaseYear || "-"}</span>

        </div>
      </div>
    </Link>
  );
}