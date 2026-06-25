"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

// --- TYPES ---
interface Program {
  id: number;
  title: string;
}

interface Movie {
  id: number;
  title: string;
  thumbnail: string | null; 
  duration: number;
  releaseYear: number | null;
  programs: Program[];
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
}

export default function MoviesPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({ page: 1, limit: 5, total: 0 });
  const [loading, setLoading] = useState(true);

  // FETCH PAGINATED MOVIES
  const loadMovies = useCallback(async (page: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/movies?page=${page}&limit=5`);
      const result = await res.json();
      
      if (result.data) {
        setMovies(result.data);
        setPagination(result.pagination);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMovies(pagination.page);
  }, [loadMovies, pagination.page]);

  // HANDLE DELETE
  const handleDelete = async (id: number, title: string) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${title}"?`
    );

    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/movies/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete movie");
      }

      setMovies((prev) => prev.filter((movie) => movie.id !== id));
      alert("Movie deleted successfully");
      loadMovies(pagination.page);
    } catch (error) {
      console.error(error);
      alert("Delete failed");
    }
  };

  const totalPages = Math.ceil(pagination.total / pagination.limit);

  if (loading) {
    return (
      <div className="text-white">
        Loading movies...
      </div>
    );
  }

  return (
    <div>
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">
          Movies
        </h1>

        <Link
          href="/admin/movies/create"
          className="bg-[#106EE9] px-5 py-3 rounded-xl"
        >
          + Add Movie
        </Link>
      </div>

      {/* Main Data Table */}
      <div className="bg-[#0B1026] rounded-2xl border border-white/10 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10 text-gray-400">
              <th className="p-5 text-left w-[80px]">Cover</th>
              <th className="p-5 text-left">Movie Title</th>
              <th className="p-5 text-left">Genre / Program</th>
              <th className="p-4 text-left">Release Year</th>
              <th className="p-4 text-left">Duration</th>
              <th className="p-5 text-left">Action</th>
            </tr>
          </thead>

          <tbody>
            {movies.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-10 text-center text-gray-400">
                  No movies found.
                </td>
              </tr>
            ) : (
              movies.map((movie) => {
                const programTags = movie.programs && movie.programs.length > 0
                  ? movie.programs.map((p) => p.title).join(", ")
                  : "-";

                return (
                  <tr
                    key={movie.id}
                    className="border-b border-white/10 vertical-middle"
                  >
                    {/* Thumbnail Display Section */}
                    <td className="p-5">
                      {movie.thumbnail ? (
                        <img 
                          src={movie.thumbnail} 
                          alt={movie.title} 
                          className="w-12 h-16 object-cover rounded-lg bg-white/5 border border-white/10 shadow-md"
                        />
                      ) : (
                        <div className="w-12 h-16 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center text-[10px] text-gray-500 text-center p-1">
                          No Pic
                        </div>
                      )}
                    </td>

                    <td className="p-5 font-medium text-white">{movie.title}</td>
                    <td className="p-5 text-gray-300">{programTags}</td>
                    <td className="p-4 text-gray-300">{movie.releaseYear ?? "-"}</td>
                    <td className="p-4 text-gray-300">{movie.duration ? `${movie.duration} mins` : "-"}</td>

                    <td className="p-5">
                      <div className="flex gap-3">
                        <Link
                          href={`/admin/movies/${movie.id}`}
                          className="bg-[#106EE9] px-4 py-2 rounded-lg text-sm"
                        >
                          Details
                        </Link>

                        <Link
                          href={`/admin/movies/edit/${movie.id}`}
                          className="bg-[#400FD3] px-4 py-2 rounded-lg text-sm"
                        >
                          Edit
                        </Link>

                        <button
                          onClick={() => handleDelete(movie.id, movie.title)}
                          className="bg-[#F41010] px-4 py-2 rounded-lg text-white text-sm"
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

        {/* Pagination UI Controls */}
        {totalPages > 1 && (
          <div className="p-5 flex justify-between items-center border-t border-white/10 text-sm text-gray-400">
            <div>
              Page <span className="text-white font-medium">{pagination.page}</span> of{" "}
              <span className="text-white font-medium">{totalPages}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPagination((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                disabled={pagination.page === 1}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                Previous
              </button>
              <button
                onClick={() => setPagination((prev) => ({ ...prev, page: Math.min(totalPages, prev.page + 1) }))}
                disabled={pagination.page === totalPages}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}