
"use client";

import Link from "next/link";
import Image from "next/image";

import type { Movie } from "@/types/movie";

export default function Playlist({ movies }: { movies: Movie[] }) {
  if (!movies.length) {
    return <p className="text-gray-400">No playlist available.</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
      {movies.map((movie, index) => (
        <Link
          key={`${movie.playlistId}-${movie.playlistItemId}`}

          href={`/movies/watch/${movie.playlistItemId}`}

          className="overflow-hidden rounded-xl bg-zinc-900 transition hover:scale-105"
        >
          <div className="relative h-[180px] w-full">
            <Image
              src={movie.thumbnail ?? "/images/no-image.png"}

              alt={movie.title}

              fill

              className="object-cover"

              unoptimized
            />
          </div>

          <div className="p-3">
            <h3 className="text-sm font-bold text-white">Part {index + 1}</h3>

            <p className="line-clamp-1 text-xs text-gray-400">{movie.title}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
