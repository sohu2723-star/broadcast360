"use client";

import { useEffect, useState } from "react";
import { Film, Flame } from "lucide-react";

import type { Movie } from "@/types/movie";

import { getMovies } from "@/services/movie.service";

import MovieSearch from "./MovieSearch";
import MovieGrid from "./MovieGrid";
import EntitlementBar from "@/components/vod/EntitlementBar";

export default function MoviePage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [currentPage, setCurrentPage] = useState(1);

  const moviesPerPage = 10;

  useEffect(() => {
    async function loadData() {
      try {
        const movieData = await getMovies();
        setMovies(movieData);
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

    return matchSearch;
  });

 const hotMovies = [...filteredMovies]
  .sort(() => Math.random() - 0.5)
  .slice(0, 8);

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

  return (
    <main className="min-h-screen bg-[#121212] px-4 py-10 text-white sm:px-6">
  <div className="mx-auto max-w-7xl">
        <h1 className="mb-8 text-4xl font-semibold tracking-tight">Movies</h1>

        <EntitlementBar />

        {/* Search */}

             <div className="mb-8 max-w-2xl">
          <MovieSearch value={search} onChange={changeSearch} />
        </div>

        {/* Hot Movies */}

        <section className="mb-16">
  {loading ? (
    <div>
      Loading movies...
    </div>
  ) : filteredMovies.length === 0 ? (
    <div>
      No movies found.
    </div>
  ) : (
    <MovieGrid
      title={<span className="inline-flex items-center gap-2"><Flame size={18} strokeWidth={1.8} className="text-white/70" aria-hidden="true" />HOT MOVIES</span>}
      movies={hotMovies}
      horizontal
    />
  )}
</section>

        {/* All Movies */}

        <section className="mb-16">
          <h2 className="mb-6 text-2xl font-bold"><span className="inline-flex items-center gap-2"><Film size={22} strokeWidth={1.8} className="text-white/70" aria-hidden="true" />ALL MOVIES ARCHIVE</span></h2>

          {loading ? (
            <div className="rounded-2xl  bg-[#1f1f1f] p-10 text-center text-gray-400">
              Loading movies...
            </div>
          ) : filteredMovies.length === 0 ? (
            <div className="rounded-2xl  bg-[#1f1f1f] p-10 text-center text-gray-400">
              No movies found.
            </div>
          ) : (
            <>
              <MovieGrid movies={paginatedMovies} />

              <div className="mt-12 flex items-center justify-center gap-5">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => prev - 1)}
                  className="rounded-lg bg-[#2a2a2a] px-5 py-2 transition hover:bg-[#3a3a3a] disabled:opacity-40"
                >
                  Previous
                </button>

                <span className="text-gray-300">
                  Page {currentPage} / {totalPages || 1}
                </span>

                <button
                  disabled={currentPage === totalPages || totalPages === 0}
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                  className="rounded-lg bg-[#2a2a2a] px-5 py-2 transition hover:bg-[#3a3a3a] disabled:opacity-40"
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
