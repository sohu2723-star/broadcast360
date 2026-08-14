"use client";

import { useState } from "react";
import Image from "next/image";

import type { Movie } from "@/types/movie";
import FavoriteButton from "../favorite/FavoriteButton";

function formatScheduleDate(date?: string | null) {
  if (!date) return "-";

  const d = new Date(date);

  return `${d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
  })} ${d.getFullYear()}, ${d.toLocaleString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })}`;
}

export default function MovieMetadata({ movie }: { movie: Movie }) {
  const [showMore, setShowMore] = useState(false);

  const limit = 150;

  const description = movie.description || "No description available.";

  const shortDescription =
    description.length > limit
      ? `${description.slice(0, limit)}...`
      : description;

  return (
    <div className="w-full">
      {/* Title */}

      <div className="flex items-center justify-between gap-4">
  <h1 className="text-2xl font-bold text-white">
    {movie.title}
  </h1>

  <FavoriteButton
    content={{
      movieId: movie.id,
    }}
  />
</div>

      {/* Channel */}

      <div className="mt-3 flex items-center gap-3">
        {movie.channelLogo && (
          <div className="relative h-10 w-10 overflow-hidden rounded-full">
            <Image
              src={movie.channelLogo}

              alt={movie.channelName || "Channel"}

              fill

              sizes="40px"

              unoptimized

              className="object-cover"
            />
          </div>
        )}

        <p className="text-base font-bold text-white">
          {movie.channelName || "-"}
        </p>
      </div>

      {/* Metadata */}

      <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-gray-400">
        <span>{movie.genre || "Movie"}</span>

        {movie.releaseYear && <span>{movie.releaseYear}</span>}

        {movie.scheduleStart && (
          <span>{formatScheduleDate(movie.scheduleStart)}</span>
        )}
      </div>

      {/* Description */}

      <div className="mt-4 max-w-4xl break-words text-sm leading-6 text-gray-400">
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
