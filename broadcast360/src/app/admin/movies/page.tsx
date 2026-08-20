"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import Pagination from "@/components/admin/Pagination";

interface Movie {
  id: number;
  title: string;
  thumbnail: string | null;
  duration: number;
  releaseYear: number | null;
  genre: string | null;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
}

export default function MoviesPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 5,
    total: 0,
  });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return [hrs, mins, secs].map((v) => String(v).padStart(2, "0")).join(":");
  };

  // FETCH MOVIES WITH SEARCH & PAGINATION
  const loadMovies = useCallback(async (page: number, query: string) => {
    setLoading(true);
    try {
      const searchParam = query ? `&search=${encodeURIComponent(query)}` : "";
      const res = await fetch(`/api/movies?page=${page}&limit=5${searchParam}`);
      const result = await res.json();

      if (result.data) {
        setMovies(result.data);
        setPagination(result.pagination);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Sync state with Debounce for Search & Direct Call for Page Change
  useEffect(() => {
    const timer = setTimeout(() => {
      loadMovies(pagination.page, search);
    }, 400);

    return () => clearTimeout(timer);
  }, [pagination.page, search, loadMovies]);

  // Handle Input Changes & Reset to Page 1
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleDelete = async (id: number, title: string) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${title}"?`,
    );
    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/movies/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete movie");
      alert("Movie deleted successfully");
      loadMovies(pagination.page, search);
    } catch (error) {
      console.error(error);
      alert("Delete failed");
    }
  };

  const totalPages = Math.ceil(pagination.total / pagination.limit) || 1;

  return (
    <div>
      {/* Header Section */}
      <div className="mb-8 flex items-center justify-between gap-4">
        {/* Search Input */}
        <div className="w-full max-w-md">
          <input
            type="text"
            placeholder="Search movies by title or genre..."
            value={search}
            onChange={handleSearchChange}
            className="w-full rounded-xl border border-white/10 bg-[#0B1026] px-4 py-3 text-sm text-white placeholder-gray-500 transition focus:border-[#4f6689] focus:outline-none"
          />
        </div>

        <Link
          href="/admin/movies/create"
          className="rounded-xl bg-[#4f6689] px-5 py-3 whitespace-nowrap"
        >
          + Add Movie
        </Link>
      </div>

      {/* Main Data Table */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0B1026]">
        {loading ? (
          <div className="p-10 text-center text-white">Loading movies...</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 text-gray-400">
                <th className="w-[80px] p-5 text-left">Cover</th>
                <th className="p-5 text-left">Movie Title</th>
                <th className="p-5 text-left">Genre</th>
                <th className="p-4 text-left">Release Year</th>
                <th className="p-4 text-left">Duration</th>
                <th className="p-5 text-left">Action</th>
              </tr>
            </thead>

            <tbody>
              {movies.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="p-14 text-center text-sm text-gray-500"
                  >
                    No movies found matching your search criteria.
                  </td>
                </tr>
              ) : (
                movies.map((movie) => {
                  return (
                    <tr
                      key={movie.id}
                      className="border-b border-white/10 hover:bg-white/[0.03]"
                    >
                      <td className="p-5">
                        {movie.thumbnail ? (
                          <Image
                            src={movie.thumbnail}
                            alt={movie.title}
                            width={48}
                            height={64}
                            className="h-16 w-12 rounded-lg border border-white/10 bg-white/5 object-cover shadow-md"
                          />
                        ) : (
                          <div className="flex h-16 w-12 items-center justify-center rounded-lg border border-white/10 bg-white/5 p-1 text-center text-[10px] text-gray-500">
                            No Pic
                          </div>
                        )}
                      </td>

                      <td className="p-5 font-medium text-white">
                        {movie.title}
                      </td>
                      <td className="p-5 text-gray-300">
                        {movie.genre ?? "-"}
                      </td>
                      <td className="p-10 text-gray-300">
                        {movie.releaseYear ?? "-"}
                      </td>
                      <td className="p-4 text-gray-300">
                        {movie.duration ? formatDuration(movie.duration) : "-"}
                      </td>

                      <td className="p-5">
                        <div className="flex gap-3">
                          <Link
                            href={`/admin/movies/${movie.id}`}
                            className="rounded-lg bg-[#4f6689] px-4 py-2 text-sm"
                          >
                            Details
                          </Link>
                          <Link
                            href={`/admin/movies/edit/${movie.id}`}
                            className="rounded-lg bg-[#400FD3] px-4 py-2 text-sm"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(movie.id, movie.title)}
                            className="rounded-lg bg-[#F41010] px-4 py-2 text-sm text-white"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* REUSABLE PAGINATION */}
      <Pagination
        page={pagination.page}
        totalPages={totalPages}
        setPage={(newPage) => {
          const nextPg =
            typeof newPage === "function" ? newPage(pagination.page) : newPage;
          setPagination((prev) => ({ ...prev, page: nextPg }));
        }}
        loading={loading}
      />
    </div>
  );
}
