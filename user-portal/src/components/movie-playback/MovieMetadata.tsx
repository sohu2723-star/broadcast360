"use client";

import { useState } from "react";
import type { Movie } from "@/types/movie";

function formatDuration(seconds: number) {
  if (!seconds || seconds <= 0) return "-";

  const hours = Math.floor(seconds / 3600);

  const minutes = Math.floor(
    (seconds % 3600) / 60
  );

  const remainingSeconds = seconds % 60;


  if (hours > 0) {
    return `${hours}h ${minutes}m ${remainingSeconds}s`;
  }


  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  }


  return `${remainingSeconds}s`;
}
export default function MovieMetadata({ movie }: { movie: Movie }) {
  const [showMore, setShowMore] = useState(false);

  const limit = 50;

  const description = movie.description || "No description available.";

  const shortDescription =
    description.length > limit
      ? description.slice(0, limit) + "..."
      : description;

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold text-white">{movie.title}</h1>

        <span className="rounded-full bg-[#106EE9] px-3 py-1 text-xs text-white">
          🎭 {movie.genre || "Movie"}
        </span>

        <span className="rounded-full border border-[#106EE9]/30 bg-[#010312] px-3 py-1 text-xs text-gray-300">
          📺 {movie.channelName || "-"}
        </span>

        <span className="rounded-full border border-[#106EE9]/30 bg-[#010312] px-3 py-1 text-xs text-gray-300">
          📅 {movie.releaseYear || "-"}
        </span>

        <span className="rounded-full border border-[#106EE9]/30 bg-[#010312] px-3 py-1 text-xs text-gray-300">
          ⏱ {formatDuration(movie.duration)}
        </span>
      </div>

      {/* Description */}

      <div className="mt-4 max-w-full text-sm leading-6 text-gray-400 break-words">
        <p>
          {showMore ? description : shortDescription}

          {description.length > limit && (
            <button
              onClick={() => setShowMore(!showMore)}
              className="ml-2 text-[#106EE9] hover:underline"
            >
              {showMore ? "Show Less" : "More"}
            </button>
          )}
        </p>
      </div>
    </div>
  );
}
