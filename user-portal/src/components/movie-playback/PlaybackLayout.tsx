"use client";

import Link from "next/link";

import type { Movie } from "@/types/movie";

import VideoPlayer from "./VideoPlayer";
import MovieMetadata from "./MovieMetadata";
import RelatedMovies from "./RelatedMovies";

interface Props {
  movie: Movie;
  relatedMovies: Movie[];
}

export default function PlaybackLayout({ movie, relatedMovies }: Props) {
  return (
    <main className="min-h-screen bg-[#010312] text-white">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <Link
          href="/movies"
          className="mb-5 inline-flex rounded-full border border-[#106EE9]/30 bg-[#0B1026] px-4 py-2 text-sm"
        >
          ← Back to Movies
        </Link>

        <div className="mt-6 grid items-start gap-6 lg:grid-cols-[2fr_1fr]">
          {/* LEFT VIDEO AREA */}

          <div className="overflow-hidden rounded-xl border border-[#106EE9]/20 bg-[#0B1026] p-4">
            <VideoPlayer movie={movie} />

            <div className="mt-5 border-t border-white/10 pt-5">
              <MovieMetadata movie={movie} />
            </div>
          </div>

          {/* RIGHT RELATED MOVIES */}

          <div className="rounded-xl border border-[#106EE9]/20 bg-[#0B1026] p-4">
            <h2 className="mb-4 text-lg font-bold">👀 Related Movies</h2>

            <RelatedMovies movies={relatedMovies} />
          </div>
        </div>
      </div>
    </main>
  );
}
