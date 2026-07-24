"use client";

import Image from "next/image";
import { useState } from "react";

import type { Movie } from "@/types/movie";

function formatDuration(seconds?: number | string | null) {
  const totalSeconds = Number(seconds);

  if (!totalSeconds || totalSeconds <= 0) return "-";

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const sec = Math.floor(totalSeconds % 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m ${sec}s`;
  }

  return `${minutes}m ${sec}s`;
}

export default function MovieInfo({ movie }: { movie: Movie }) {
  const [showMore, setShowMore] = useState(false);

  const description = movie.description || "No description available.";

  const limit = 120;

  const shortDescription =
    description.length > limit
      ? description.slice(0, limit) + "..."
      : description;

  return (
    <div className="flex h-[560px] gap-8 overflow-hidden bg-black text-white md:flex-row">

      {/* POSTER */}

      <div className="group relative h-[500px] w-[700px] flex-shrink-0 overflow-hidden rounded-2xl bg-zinc-900 shadow-2xl">
        <Image
          src={movie.thumbnail || "/images/no-image.png"}
          alt={movie.title}
          fill
          sizes="700px"
          className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
          unoptimized
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
      </div>
      {/* INFO */}

      <div className="flex min-w-0 flex-1 flex-col">
        <h1 className="text-4xl font-bold text-white">{movie.title}</h1>

        <div className="mt-5 flex flex-wrap gap-3">
          <span className="rounded-full border border-white/20 px-4 py-2 text-sm">
            🎭 {movie.genre || "Movie"}
          </span>

          <span className="rounded-full border border-white/20 px-4 py-2 text-sm">
            📺 {movie.channelName || "-"}
          </span>

          <span className="rounded-full border border-white/20 px-4 py-2 text-sm">
            📅 {movie.releaseYear || "-"}
          </span>

          <span className="rounded-full border border-white/20 px-4 py-2 text-sm">
            ⏱ {formatDuration(movie.duration)}
          </span>
        </div>

        {/* DESCRIPTION */}

        <div className="mt-8 max-w-3xl text-sm leading-7 text-gray-300">
          <p className="break-words">
            {showMore ? description : shortDescription}
          </p>

          {description.length > limit && (
            <div className="mt-3">
              <button
                onClick={() => setShowMore(!showMore)}
                className="text-[#106EE9] hover:underline"
              >
                {showMore ? "Show Less" : "More"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
