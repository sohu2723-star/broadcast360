'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface Movie {
  id: number;
  title: string;
  description?: string;
  thumbnail?: string;
  videoUrl?: string;
  duration: number;
  releaseYear?: number;
  programs?: any[];
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
}

export default function MovieListPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 5, total: 0 });
  const [loading, setLoading] = useState(true);

  const fetchMovies = useCallback(async (page: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/movies?page=${page}&limit=5`);
      const result = await res.json();
      if (result.data) {
        setMovies(result.data);
        setPagination(result.pagination);
      }
    } catch (error) {
      console.error('Failed to fetch movies:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMovies(pagination.page);
  }, [fetchMovies, pagination.page]);

  const handleDelete = async (id: number, title: string) => {
    const confirmDelete = confirm(`Are you sure you want to delete "${title}"?`);
    if (confirmDelete) {
      alert(`Delete feature for ID: ${id} will be integrated soon!`);
    }
  };

  const totalPages = Math.ceil(pagination.total / pagination.limit);

  return (
    <div className="p-6 bg-[#0B0F19] text-white min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Movies</h1>
        <Link href="/admin/movies/new" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
          + Add Movie
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-400">Loading movies...</div>
      ) : movies.length === 0 ? (
        <div className="text-center py-10 text-gray-400 bg-[#111827] rounded-xl border border-gray-800">
          No movies found. Click "+ Add Movie" to create one.
        </div>
      ) : (
        <div className="bg-[#111827] rounded-xl border border-gray-800 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400 text-sm">
                <th className="p-4">Movie Title</th>
                <th className="p-4">Genre / Program</th>
                <th className="p-4">Release Year</th>
                <th className="p-4">Duration</th>
                <th className="p-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800 text-sm">
              {movies.map((movie) => (
                <tr key={movie.id} className="hover:bg-[#1F2937] transition">
                  <td className="p-4 font-medium flex items-center gap-3">
                    {movie.thumbnail && (
                      <img src={movie.thumbnail} alt={movie.title} className="w-10 h-14 object-cover rounded bg-gray-800" />
                    )}
                    <span>{movie.title}</span>
                  </td>
                  <td className="p-4 text-gray-300">
                    {/* Program ရှိရင် Program အမည် ပြပေးပါမယ်၊ မရှိရင် N/A ပြပါမယ် */}
                    {movie.programs && movie.programs.length > 0 
                      ? movie.programs.map(p => p.name).join(', ') 
                      : 'N/A'}
                  </td>
                  <td className="p-4 text-gray-300">{movie.releaseYear || 'N/A'}</td>
                  <td className="p-4 text-gray-300">{movie.duration} mins</td>
                  <td className="p-4 flex justify-center gap-2 mt-3">
                    <Link href={`/admin/movies/${movie.id}`} className="bg-blue-600 hover:bg-blue-700 text-xs px-3 py-1.5 rounded font-medium transition">
                      Details
                    </Link>
                    <Link href={`/admin/movies/${movie.id}/edit`} className="bg-purple-600 hover:bg-purple-700 text-xs px-3 py-1.5 rounded font-medium transition">
                      Edit
                    </Link>
                    <button onClick={() => handleDelete(movie.id, movie.title)} className="bg-red-600 hover:bg-red-700 text-xs px-3 py-1.5 rounded font-medium transition">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="p-4 flex justify-between items-center border-t border-gray-800 text-sm text-gray-400">
            <div>
              Showing <span className="text-white">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
              <span className="text-white">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of{' '}
              <span className="text-white">{pagination.total}</span> movies
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPagination((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                disabled={pagination.page === 1}
                className="px-3 py-1.5 bg-[#1F2937] hover:bg-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed text-white transition"
              >
                Previous
              </button>
              <button
                onClick={() => setPagination((prev) => ({ ...prev, page: Math.min(totalPages, prev.page + 1) }))}
                disabled={pagination.page === totalPages || totalPages === 0}
                className="px-3 py-1.5 bg-[#1F2937] hover:bg-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed text-white transition"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}