"use client";

import Link from "next/link";

import MovieInfo from "./MovieInfo";
import Playlist from "./Playlist";
import RelatedMovies from "./RelatedMovies";

import type { Movie } from "@/types/movie";

interface Props {
  movie: Movie;
  playlist: Movie[];
  relatedMovies: Movie[];
}

export default function MovieDetail({ movie, playlist, relatedMovies }: Props) {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Back Button */}

        <Link
          href="/movies"
          className="mb-8 inline-flex rounded-full border border-white/20 bg-black px-4 py-2 text-sm text-white transition hover:border-blue-500"
        >
          ← Back to Movies
        </Link>

        {/* Movie Information */}

        <section>
          <MovieInfo movie={movie} />
        </section>

        {/* Playlist */}

        <section className="mt-12">
          <h2 className="mb-5 text-2xl font-bold">🎬 Playlist</h2>

          <Playlist movies={playlist} />
        </section>

        {/* Related Movies */}

        <section className="mt-12">
          <h2 className="mb-5 text-2xl font-bold">👀 Related Movies</h2>

          <RelatedMovies movies={relatedMovies} />
        </section>
      </div>
    </main>
  );
}
