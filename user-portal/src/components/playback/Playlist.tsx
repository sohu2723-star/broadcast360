"use client";

import Image from "next/image";

import type { Movie } from "@/types/movie";

interface Props {
  movies: Movie[];
  selectedId?: number;
  onSelect: (movie: Movie) => void;
}

function formatDuration(seconds?: number | null) {
  if (!seconds) return "00:00:00";

  const hrs = Math.floor(seconds / 3600);

  const mins = Math.floor((seconds % 3600) / 60);

  const secs = seconds % 60;

  return [hrs, mins, secs]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
}

export default function Playlist({ movies, selectedId, onSelect }: Props) {
  return (
    <div>
      <h2 className="mb-4 text-lg font-bold text-white">🎬 Playlist Parts</h2>

      <div className="max-h-[480px] space-y-3 overflow-y-auto pr-2 scrollbar-thin">
        {movies.map((movie) => {
          const isActive = selectedId === movie.id;

          return (
            <button
              key={movie.id}

              onClick={() => onSelect(movie)}

              className={`flex w-full gap-3 rounded-xl border p-3 text-left transition ${
                isActive
                  ? "border-[#106EE9] bg-[#106EE9]/10"
                  : "border-[#106EE9]/20 bg-[#010312] hover:border-[#106EE9]"
              }`}
            >
              {/* Thumbnail */}

              <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-black">
                <Image
                  src={movie.thumbnail || "/images/no-image.png"}

                  alt={movie.title}

                  fill

                  sizes="96px"

                  unoptimized

                  className="object-cover transition duration-300 group-hover:scale-110"
                />
              </div>

              {/* Content */}

              <div className="min-w-0 flex-1">


                <p className="truncate text-sm text-gray-300">{movie.title}</p>

                <p className="mt-1 text-xs text-gray-400">
                  ⏱ {formatDuration(movie.duration)}
                </p>

                <p className="mt-2 flex items-center gap-1 text-[10px] font-medium uppercase text-[#106EE9]">
                  <span>▶</span>

                  <span>{isActive ? "Currently Playing" : "Play Now"}</span>
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
