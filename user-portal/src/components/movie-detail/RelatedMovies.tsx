"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

import type { Movie } from "@/types/movie";

function formatDuration(seconds: number) {
  if (!seconds || seconds <= 0) return "-";

  const minutes = Math.floor(seconds / 60);
  const sec = seconds % 60;

  return `${minutes}m ${sec}s`;
}

export default function RelatedMovies({
  movies,
}: {
  movies: Movie[];
}) {
  const [page, setPage] = useState(1);

  const perPage = 5;

  const totalPages = Math.ceil(movies.length / perPage);

  const start = (page - 1) * perPage;

  const currentMovies = movies.slice(
    start,
    start + perPage
  );

  if (!movies.length) {
    return (
      <p className="text-sm text-gray-400">
        No related movies found.
      </p>
    );
  }

  return (
    <div>

      {/* MOVIE ROW */}

      <div className="grid grid-cols-5 gap-3">

        {currentMovies.map((movie) => (

          <Link
            key={movie.movieKey}
            href={`/movies/${encodeURIComponent(movie.movieKey)}`}
            className="group relative block h-[380px] w-full overflow-hidden rounded-xl bg-zinc-900"
          >

            <Image
              src={movie.thumbnail || "/images/no-image.png"}
              alt={movie.title}
              fill
              sizes="250px"
              className="object-cover transition duration-500 group-hover:scale-110"
              unoptimized
            />


            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />


            <div className="absolute bottom-0 left-0 right-0 p-4 text-white">

              <h3 className="line-clamp-1 text-sm font-bold">
                {movie.title}
              </h3>


              <p className="mt-2 line-clamp-1 text-xs text-gray-300">
                📺 {movie.channelName || "-"}
              </p>


              <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-gray-400">

                <span>
                  🎭 {movie.genre || "Movie"}
                </span>

                <span>
                  📅 {movie.releaseYear || "-"}
                </span>

                <span>
                  ⏱ {formatDuration(movie.duration)}
                </span>

              </div>

            </div>

          </Link>

        ))}

      </div>



      {/* PAGINATION */}

      {totalPages > 1 && (

        <div className="mt-5 flex items-center justify-center gap-3">

          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="rounded-lg border border-white/20 px-4 py-2 text-sm text-white disabled:opacity-40"
          >
            ← Previous
          </button>


          <span className="text-sm text-gray-400">
            {page} / {totalPages}
          </span>


          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="rounded-lg border border-white/20 px-4 py-2 text-sm text-white disabled:opacity-40"
          >
            Next →
          </button>

        </div>

      )}

    </div>
  );
}