"use client";

import Link from "next/link";

import Image from "next/image";

import type { Movie } from "@/types/movie";

function formatDuration(seconds: number) {
  if (!seconds || seconds <= 0) return "-";

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

export default function Playlist({ movies }: { movies: Movie[] }) {
  if (!movies.length) {
    return (
      <div className="rounded-xl border border-[#106EE9]/30 bg-black p-3 text-center text-xs text-gray-400">
        No playlist available.
      </div>
    );
  }

  return (
    <div
      className={
        movies.length > 5
          ? "max-h-[500px] space-y-2 overflow-y-auto pr-2 scrollbar-thin"
          : "space-y-2"
      }
    >
      {movies.map((movie, index) => (
        <Link
          key={`${movie.id}-${movie.playlistItemId}`}
          href={`/movies/watch/${movie.playlistItemId}`}
          className="group flex h-[72px] flex-shrink-0 gap-2 rounded-lg border border-white/10 bg-[#010312] p-2 transition hover:border-[#106EE9]"
        >
          <div className="relative h-14 w-20 flex-shrink-0 overflow-hidden rounded-md bg-black">
            {movie.thumbnail ? (
              <Image
                src={movie.thumbnail}
                alt={movie.title}
                fill
                sizes="80px"
                className="object-cover transition duration-300 group-hover:scale-110"
                unoptimized
              />
            ) : (
              <div className="flex h-full items-center justify-center text-[10px] text-gray-500">
                🎬
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="truncate text-[12px] font-bold text-white">
              Part {index + 1}
            </h3>

            <p className="truncate text-[10px] text-gray-400">{movie.title}</p>

            <p className="truncate text-[10px] text-gray-400">
              🎭 {movie.genre || "Movie"}
            </p>

            <p className="text-[10px] text-gray-500">
              ⏱ {formatDuration(movie.duration)}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
