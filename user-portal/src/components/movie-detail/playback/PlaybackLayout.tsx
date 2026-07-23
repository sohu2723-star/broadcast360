"use client";

import Link from "next/link";

import type { Movie } from "@/types/movie";

import VideoPlayer from "./VideoPlayer";
import MovieMetadata from "./MovieMetadata";
import Playlist from "./Playlist";

interface Props {
  movie: Movie;
  playlist: Movie[];
}

export default function PlaybackLayout({
  movie,
  playlist,
}: Props) {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-7xl px-6 py-8">

        <Link
          href={`/movies/${movie.movieKey}`}
          className="mb-5 inline-flex rounded-full border border-[#106EE9]/30 bg-black px-4 py-2 text-sm transition hover:border-[#106EE9]"
        >
          ← Back to Movie Detail
        </Link>


        <div className="mt-6 grid items-start gap-6 lg:grid-cols-[2fr_1.1fr]">


          {/* LEFT VIDEO */}

          <div className="h-[620px] overflow-hidden rounded-xl border border-[#11151a]/30 bg-black p-4">

            <div className="h-[400px]">
              <VideoPlayer movie={movie} />
            </div>


            <div className="mt-5 border-t border-[#106EE9]/30 pt-5">
              <div className="max-h-[160px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-700">
                <MovieMetadata movie={movie} />
              </div>
            </div>

          </div>



          {/* RIGHT PLAYLIST */}

          <div className="h-[620px] rounded-xl border border-[#11151a]/30 bg-black p-4">

            <h2 className="mb-4 text-lg font-bold">
              🎬 Playlist
            </h2>


            <div className="h-[550px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-700">
              <Playlist movies={playlist} />
            </div>

          </div>


        </div>


      </div>
    </main>
  );
}