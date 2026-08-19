"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

import type { Movie } from "@/types/movie";

import VideoPlayer from "./VideoPlayer";
import MovieMetadata from "./MovieMetadata";
import Playlist from "./Playlist";
import RelatedMovies from "./RelateMovies";
import FavoriteButton from "../favorite/FavoriteButton";

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
  const [currentMovie, setCurrentMovie] = useState(movie);

  const leftRef = useRef<HTMLDivElement>(null);
  const playlistContentRef = useRef<HTMLDivElement>(null);

  const [leftHeight, setLeftHeight] = useState(0);
  const [playlistHeight, setPlaylistHeight] = useState(0);

  useEffect(() => {
    if (!leftRef.current) return;

    const observer = new ResizeObserver(() => {
      if (leftRef.current) {
        setLeftHeight(leftRef.current.offsetHeight);
      }
    });

    observer.observe(leftRef.current);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!playlistContentRef.current) return;

    const observer = new ResizeObserver(() => {
      if (playlistContentRef.current) {
        setPlaylistHeight(playlistContentRef.current.offsetHeight);
      }
    });

    observer.observe(playlistContentRef.current);

    return () => observer.disconnect();
  }, [playlist]);

  const needScroll = playlistHeight > leftHeight;

  const playlistBoxHeight = needScroll ? leftHeight : "auto";

  return (
    <main className="min-h-screen bg-[#010312] text-white">
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* <Link
          href="/movies"
          className="mb-5 inline-flex rounded-full border border-[#106EE9]/30 bg-[#0B1026] px-4 py-2 text-sm transition hover:bg-[#106EE9]/20"
        >
          ← Back to Movies
        </Link> */}

        <div className="mt-6 grid items-start gap-6 lg:grid-cols-[2fr_1fr]">
          {/* VIDEO + METADATA */}

          <section
            ref={leftRef}
            className="overflow-hidden rounded-xl border border-[#106EE9]/20 bg-[#0B1026] p-4"
          >
            <VideoPlayer movie={currentMovie} />

            <div className="mt-5 border-t border-white/10 pt-5">
               <MovieMetadata movie={currentMovie} />
            </div>
          </section>

          {/* PLAYLIST */}

          <aside
            style={{
              height: playlistBoxHeight,
            }}
            className="flex flex-col overflow-hidden rounded-xl border border-[#106EE9]/20 bg-[#0B1026] p-4"
          >
            <div
              className={
                needScroll
                  ? "min-h-0 flex-1 overflow-y-auto playlist-scroll"
                  : ""
              }
            >
              <div ref={playlistContentRef}>
                <Playlist
                  movies={playlist}
                  selectedId={currentMovie.id}
                  onSelect={setCurrentMovie}
                />
              </div>
            </div>
          </aside>
        </div>

        {/* RELATED MOVIES */}

        <section className="mt-12">
          <RelatedMovies movies={relatedMovies} genre={currentMovie.genre} />
        </section>
      </div>
    </main>
  );
}
