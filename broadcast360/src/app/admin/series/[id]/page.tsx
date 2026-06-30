"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Episode = {
  id: number;
  episodeNo: number;
  title: string;
  videoUrl: string | null;
  thumbnailUrl: string | null;
  duration: number;
  createdAt: string;
};

type Series = {
  id: number;
  title: string;
  description: string | null;
  genre: string | null;
  thumbnail: string | null;
  releaseYear: number | null;
  createdAt: string;
  episodes: Episode[];
};

export default function SeriesDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [series, setSeries] = useState<Series | null>(null);
  const [seriesId, setSeriesId] = useState<string>("");

  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const limit = 5;

  const loadSeries = async (id: string) => {
    try {
      setLoading(true);

      const res = await fetch(
        `/api/series/${id}?page=${page}&limit=${limit}`
      );

      if (!res.ok) {
        throw new Error("Failed to fetch series");
      }

      const result = await res.json();

      setSeries(result.data || null);
      setTotalPages(result.totalPages || 1);
    } catch (err) {
      console.error(err);
      setSeries(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function init() {
      const { id } = await params;

      setSeriesId(id);

      await loadSeries(id);
    }

    init();
  }, [params, page]);

  const handleDelete = async (episodeId: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this episode?"
    );

    if (!confirmed) return;

    try {
      const res = await fetch(`/api/episodes/${episodeId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Delete failed");
      }

      await loadSeries(seriesId);

      alert("Episode deleted successfully");
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  if (loading) {
    return <div className="text-white p-6">Loading...</div>;
  }

  if (!series) {
    return <div className="text-white p-6">No series found</div>;
  }

  return (
    <div className="text-white p-6">
      <h1 className="text-3xl font-bold mb-8">
        {series.title}
      </h1>

      <div className="bg-[#0B1026] p-6 rounded-xl mb-6">
        <p>{series.description ?? "-"}</p>
      </div>

      <div className="bg-[#0B1026] rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="p-4 text-left">Episode</th>
              <th className="p-4 text-left">Title</th>
              <th className="p-4 text-left">Media</th>
              <th className="p-4 text-left">Duration</th>
              <th className="p-4 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {series.episodes.map((ep) => (
              <tr
                key={ep.id}
                className="border-b border-white/10"
              >
                <td className="p-4">
                  EP {ep.episodeNo}
                </td>

                <td className="p-4">{ep.title}</td>

                <td className="p-4">
                  {ep.thumbnailUrl ? (
                    <Link
                      href={`/admin/series/${series.id}/episodes/${ep.id}`}
                    >
                      <img
                        src={ep.thumbnailUrl}
                        alt={ep.title}
                        className="w-20 h-12 rounded object-cover cursor-pointer"
                      />
                    </Link>
                  ) : (
                    "No Thumbnail"
                  )}
                </td>

                <td className="p-4">
                  {ep.duration}s
                </td>

                <td className="p-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDelete(ep.id)}
                      className="px-3 py-1 bg-red-600 rounded"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {series.episodes.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="p-6 text-center text-gray-400"
                >
                  No episodes found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex gap-2 mt-6 justify-center">
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
          className="px-3 py-1 bg-gray-700 rounded disabled:opacity-50"
        >
          Prev
        </button>

        <span>
          Page {page} / {totalPages}
        </span>

        <button
          disabled={page === totalPages}
          onClick={() => setPage((p) => p + 1)}
          className="px-3 py-1 bg-gray-700 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}