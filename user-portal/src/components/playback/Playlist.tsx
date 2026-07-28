"use client";

import Image from "next/image";

import type { Movie } from "@/types/movie";

export default function Playlist({
  movies,
}: {
  movies: Movie[];
}) {
  return (
    <div className="max-h-[480px] space-y-3 overflow-y-auto pr-2 scrollbar-thin">
      {movies.map((movie, index) => (
        <div
          key={movie.id}
          className="group flex h-[90px] gap-3 rounded-xl border border-[#106EE9]/20 bg-[#010312] p-3 transition hover:border-[#106EE9]"
        >
          <div className="relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-black">
            <Image
              src={movie.thumbnail || "/images/no-image.png"}
              alt={movie.title}
              fill
              sizes="96px"
              className="object-cover transition duration-300 group-hover:scale-110"
              unoptimized
            />
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-bold text-white">
              Part {index + 1}
            </h3>

            <p className="truncate text-xs text-gray-400">
              {movie.title}
            </p>

            <p className="truncate text-xs text-gray-500">
              🎬 Playlist
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}