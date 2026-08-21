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
      className="group relative block h-[380px] w-full min-w-0 overflow-hidden rounded-xl bg-[#1f1f1f]"
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

      <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
        {movie.accessType === "PREMIUM" ? (
          <span className="mb-3 inline-flex rounded-full border border-white/20 bg-black/45 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/85">
            Premium
          </span>
        ) : null}

        <h3 className="mb-2 line-clamp-1 text-lg font-bold">
          {movie.playlistName || movie.title}
        </h3>

        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">

          <span>
            {movie.genre || "Movie"}
          </span>

          <span>
            ·
          </span>

          <span>
            {movie.releaseYear || "-"}
          </span>

        </div>

      </div>
    </Link>
  );
}