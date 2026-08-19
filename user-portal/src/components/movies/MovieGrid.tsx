"use client";

import { useRef } from "react";

import type { Movie } from "@/types/movie";
import MovieCard from "./MovieCard";

interface Props {
  title?: string;
  movies: Movie[];
  horizontal?: boolean;
}

export default function MovieGrid({
  title,
  movies,
  horizontal = false,
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  function scrollLeft() {
    scrollRef.current?.scrollBy({
      left: -350,
      behavior: "smooth",
    });
  }

  function scrollRight() {
    scrollRef.current?.scrollBy({
      left: 350,
      behavior: "smooth",
    });
  }

  if (!movies || movies.length === 0) {
    return (
      <section className="mb-10">
        {title && (
          <h2 className="mb-5 text-2xl font-bold text-white">
            {title}
          </h2>
        )}

        <p className="text-gray-400">
          No movies found.
        </p>
      </section>
    );
  }

  return (
    <section className="mb-10">

      {title && (
        <h2 className="mb-5 text-2xl font-bold text-white">
          {title}
        </h2>
      )}

      {horizontal ? (
        <div className="relative">

          <button
            onClick={scrollLeft}
            className="absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/70 px-3 py-2 text-2xl text-white"
          >
            ‹
          </button>


          <div
            ref={scrollRef}
            className="flex gap-5 overflow-x-auto scroll-smooth hide-scrollbar"
          >

            {movies.map((movie) => (
              <div
                key={movie.id}
                className="min-w-[250px] flex-shrink-0"
              >
                <MovieCard movie={movie} />
              </div>
            ))}

          </div>


          <button
            onClick={scrollRight}
            className="absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/70 px-3 py-2 text-2xl text-white"
          >
            ›
          </button>


        </div>
      ) : (

  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">

  {movies.map((movie) => (
    <MovieCard
      key={movie.id}
      movie={movie}
    />
  ))}

</div>

)}

    </section>
  );
}