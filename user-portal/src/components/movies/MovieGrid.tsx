"use client";

import { useRef, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import type { Movie } from "@/types/movie";
import MovieCard from "./MovieCard";

interface Props {
  title?: ReactNode;
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
            type="button"
            aria-label="Scroll movies left"
            onClick={scrollLeft}
            className="absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-[#2a2a2a]/90 p-2 text-white transition hover:bg-[#3a3a3a]"
          >
            <ChevronLeft size={22} aria-hidden="true" />
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
            type="button"
            aria-label="Scroll movies right"
            onClick={scrollRight}
            className="absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-[#2a2a2a]/90 p-2 text-white transition hover:bg-[#3a3a3a]"
          >
            <ChevronRight size={22} aria-hidden="true" />
          </button>


        </div>
      ) : (

  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">

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