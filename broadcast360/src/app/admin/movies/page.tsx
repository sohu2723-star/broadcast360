"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

interface Program {
  id: number;
  name: string;
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
  const [search, setSearch] = useState(""); // Search state
  const [loading, setLoading] = useState(true);

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
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Sync state 
  useEffect(() => {
    loadMovies(pagination.page, search);
  }, [loadMovies, pagination.page]);

  // Handle Input Changes & Reset to Page 1
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    setPagination((prev) => ({ ...prev, page: 1 })); 
    loadMovies(1, value);
  };

  const handleDelete = async (id: number, title: string) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete "${title}"?`);
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

  const totalPages = Math.ceil(pagination.total / pagination.limit);

  return (
    <div>
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Movies</h1>
        <Link href="/admin/movies/create" className="bg-[#106EE9] px-5 py-3 rounded-xl">
          + Add Movie
        </Link>
      </div>

     
      <div className="mb-6 max-w-md">
        <input
          type="text"
          placeholder="Search movies by title or genre..."
          value={search}
          onChange={handleSearchChange}
          className="w-full bg-[#0B1026] text-white border border-white/10 rounded-xl px-4 py-3 placeholder-gray-500 focus:outline-none focus:border-[#106EE9] transition text-sm"
        />
      </div>

      {/* Main Data Table */}
      <div className="bg-[#0B1026] rounded-2xl border border-white/10 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-white">Loading movies...</div>
        ) : (
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
                  {/* Empty state handles no results */}
                  <td colSpan={6} className="p-14 text-center text-gray-500 text-sm">
                    No movies found matching your search criteria.
                  </td>
                </tr>
              ) : (
                movies.map((movie) => {
                  const programTags = movie.programs && movie.programs.length > 0
                    ? movie.programs.map((p) => p.name).join(", ")
                    : "-";

                  return (
                    <tr key={movie.id} className="border-b border-white/10 vertical-middle">
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
                          <Link href={`/admin/movies/${movie.id}`} className="bg-[#106EE9] px-4 py-2 rounded-lg text-sm">
                            Details
                          </Link>
                          <Link href={`/admin/movies/edit/${movie.id}`} className="bg-[#400FD3] px-4 py-2 rounded-lg text-sm">
                            Edit
                          </Link>
                          <button onClick={() => handleDelete(movie.id, movie.title)} className="bg-[#F41010] px-4 py-2 rounded-lg text-white text-sm">
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

        {/* Pagination UI Controls */}
        {!loading && totalPages > 1 && (
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