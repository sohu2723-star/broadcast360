"use client";

import { useEffect, useState } from "react";

import type { Movie } from "@/types/movie";
import type { Channel } from "@/types/channel";

import { getMovies } from "@/services/movie.service";
import { channelService } from "@/services/channel.service";

import MovieSearch from "./MovieSearch";
import ChannelFilter from "./ChannelFilter";
import HotMovieSection from "./HotMovieSection";
import MovieGrid from "./MovieGrid";

export default function MoviePage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [channel, setChannel] = useState("");

  const [currentPage, setCurrentPage] = useState(1);

  const moviesPerPage = 10;

  useEffect(() => {
    async function loadData() {
      try {
        const [movieData, channelData] = await Promise.all([
          getMovies(),
          channelService.getAllChannels(),
        ]);

        setMovies(movieData);
        setChannels(channelData);
      } catch (error) {
        console.error("Failed loading movies page:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const filteredMovies = movies.filter((movie) => {
    const matchSearch = movie.title
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchChannel =
      channel === "" || movie.channelId?.toString() === channel;

    return matchSearch && matchChannel;
  });

  const hotMovies = filteredMovies.slice(0, 5);

  // Pagination

  const totalPages = Math.ceil(filteredMovies.length / moviesPerPage);

  const paginatedMovies = filteredMovies.slice(
    (currentPage - 1) * moviesPerPage,
    currentPage * moviesPerPage,
  );

  function changeSearch(value: string) {
    setSearch(value);
    setCurrentPage(1);
  }

  function changeChannel(value: string) {
    setChannel(value);
    setCurrentPage(1);
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-2 md:mx-4 lg:mx-6 max-w-7xl py-10">
        <h1 className="mb-8 text-4xl font-bold">MOVIES</h1>

        {/* Search + Channel Filter */}

        <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-center">
          <div className="flex-1">
            <MovieSearch value={search} onChange={changeSearch} />
          </div>

          <div className="w-full md:w-72">
            <ChannelFilter
              value={channel}
              channels={channels}
              onChange={changeChannel}
            />
          </div>
        </div>

        {/* Hot Movies */}

        <section className="mb-16">
          <h2 className="mb-6 text-2xl font-bold">🔥LASTEST MOVIES SHOWCASE</h2>

          {loading ? (
            <div className="rounded-2xl  bg-black p-10 text-center text-gray-400">
              Loading movies...
            </div>
          ) : filteredMovies.length === 0 ? (
            <div className="rounded-2xl  bg-black p-10 text-center text-gray-400">
              No movies found.
            </div>
          ) : (
            <HotMovieSection movies={hotMovies} />
          )}
        </section>

        {/* All Movies */}

        <section className="mb-16">
          <h2 className="mb-6 text-2xl font-bold">🎬 ALL MOVIES ARCHIVE</h2>

          {loading ? (
            <div className="rounded-2xl  bg-black p-10 text-center text-gray-400">
              Loading movies...
            </div>
          ) : filteredMovies.length === 0 ? (
            <div className="rounded-2xl  bg-black p-10 text-center text-gray-400">
              No movies found.
            </div>
          ) : (
            <>
              <MovieGrid movies={paginatedMovies} />

              <div className="mt-12 flex items-center justify-center gap-5">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => prev - 1)}
                  className="rounded-lg bg-[#11151a] px-5 py-2 disabled:opacity-40"
                >
                  Previous
                </button>

                <span className="text-gray-300">
                  Page {currentPage} / {totalPages || 1}
                </span>

                <button
                  disabled={currentPage === totalPages || totalPages === 0}
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                  className="rounded-lg bg-[#11151a] px-5 py-2 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
