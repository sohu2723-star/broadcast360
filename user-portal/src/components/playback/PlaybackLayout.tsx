"use client";

import Link from "next/link";

import type { Movie } from "@/types/movie";

import VideoPlayer from "./VideoPlayer";
import MovieMetadata from "./MovieMetadata";
import Playlist from "./Playlist";
import RelatedMovies from "./RelateMovies";

interface Props {
  movie: Movie;
  playlist: Movie[];
  relatedMovies: Movie[];
}

export default function PlaybackLayout({
  movie,
  playlist,
  relatedMovies,
}: Props) {
  return (
    <main className="min-h-screen bg-[#010312] text-white">
      <div className="mx-auto max-w-7xl px-6 py-8">

        <Link
          href="/movies"
          className="mb-5 inline-flex rounded-full border border-[#106EE9]/30 bg-[#0B1026] px-4 py-2 text-sm transition hover:bg-[#106EE9]/20"
        >
          ← Back to Movies
        </Link>


        <div className="mt-6 grid items-start gap-6 lg:grid-cols-[1.8fr_1fr]">


          {/* VIDEO AREA */}
          <section className="overflow-hidden rounded-xl border border-[#106EE9]/20 bg-[#0B1026] p-4">

            <div className="w-full max-w-5xl">
              <VideoPlayer movie={movie} />
            </div>


            <div className="mt-5 border-t border-white/10 pt-5">
              <MovieMetadata movie={movie} />
            </div>

          </section>



          {/* PLAYLIST AREA */}
          <aside className="self-start rounded-xl border border-[#106EE9]/20 bg-[#0B1026] p-4">

            <h2 className="mb-5 text-xl font-bold">
              🎬 Playlist
            </h2>


            <Playlist movies={playlist} />

          </aside>


        </div>



        {/* RELATED MOVIES */}
        <section className="mt-10">

          <RelatedMovies
            movies={relatedMovies}
            genre={movie.genre}
          />

        </section>


      </div>
    </main>
  );
}