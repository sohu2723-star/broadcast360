"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useRef } from "react";

import type { Movie } from "@/types/movie";

interface Props {
  movies: Movie[];
  genre?: string | null;
}

function formatDuration(seconds: number) {
  if (!seconds || seconds <= 0) return "-";

  const minutes = Math.floor(seconds / 60);

  return `${minutes}m`;
}

export default function RelatedMovies({
  movies,
  genre,
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const relatedMovies = useMemo(() => {
    if (!movies || !genre) return [];

    const currentGenre = genre.trim().toLowerCase();

    const matchedMovies = movies.filter((movie) => {
      const movieGenre = movie.genre?.trim().toLowerCase();

      return movieGenre === currentGenre;
    });

    const shuffledMovies = [...matchedMovies].sort((a, b) => {
      const aValue = (a.id * 9301 + 49297) % 233280;
      const bValue = (b.id * 9301 + 49297) % 233280;

      return aValue - bValue;
    });

    return shuffledMovies.slice(0, 10);
  }, [movies, genre]);


  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;

    scrollRef.current.scrollBy({
      left: direction === "left" ? -300 : 300,
      behavior: "smooth",
    });
  };


  if (!relatedMovies.length) {
    return null;
  }


  return (
    <section className="mt-6 relative">

      <h2 className="mb-3 text-xl font-bold text-white">
        🎬 Related Movies
      </h2>


      {/* LEFT ARROW */}
      <button
        onClick={() => scroll("left")}
        className="absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/20 bg-[#0B1026] px-3 py-2 text-xl text-white hover:bg-[#106EE9]/40"
      >
        &lt;
      </button>


      {/* MOVIES */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-hidden scroll-smooth"
      >
        {relatedMovies.map((movie) => (
          <Link
            key={movie.id}
            href={`/movies/watch/${movie.playlistId}`}
            className="group relative block h-[380px] w-[250px] flex-shrink-0 overflow-hidden rounded-xl bg-zinc-900 transition hover:scale-105"
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

              <h3 className="truncate text-lg font-bold">
                {movie.playlistName || movie.title}
              </h3>


              <p className="mt-1 truncate text-xs text-gray-300">
                📺 {movie.channelName || "-"}
              </p>


              <div className="mt-1 flex gap-2 overflow-hidden text-xs text-gray-400">

                <span className="truncate">
                  🎭 {movie.genre || "Movie"}
                </span>

                <span className="truncate">
                  📅 {movie.releaseYear || "-"}
                </span>

                <span className="truncate">
                  ⏱ {formatDuration(movie.duration)}
                </span>

              </div>

            </div>

          </Link>
        ))}
      </div>


      {/* RIGHT ARROW */}
      <button
        onClick={() => scroll("right")}
        className="absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/20 bg-[#0B1026] px-3 py-2 text-xl text-white hover:bg-[#106EE9]/40"
      >
        &gt;
      </button>

    </section>
  );
}