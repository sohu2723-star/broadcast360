"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Episode = {
  id: number;
  episodeNo: number;
  title: string;
  videoUrl: string | null;
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

  // ⭐ PAGINATION STATES ADDED
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 5;

  useEffect(() => {
    async function loadSeries() {
      const { id } = await params;

      const res = await fetch(
        `/api/series/${id}?page=${page}&limit=${limit}`
      );

      const result = await res.json();

      console.log("Series Data:", result.data);

      setSeries(result.data);
      setTotalPages(result.totalPages || 1);
    }

    loadSeries();
  }, [params, page]);

  if (!series) {
    return <div className="text-white p-6">Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">
        Series Details
      </h1>

      {/* SERIES INFO (UNCHANGED) */}
      <div className="bg-[#0B1026] rounded-2xl p-8 border border-white/10 mb-8">
        <div className="flex gap-6">
          <div className="w-32 h-32 bg-slate-700 rounded-lg overflow-hidden">
            {series.thumbnail ? (
              <img
                src={series.thumbnail}
                alt={series.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-4xl">
                🎬
              </div>
            )}
          </div>

          <div>
            <h2 className="text-2xl font-bold">
              {series.title}
            </h2>

            <p className="text-gray-400 mt-2">
              {series.description ?? "-"}
            </p>

            <p className="mt-3">
              <strong>Genre:</strong>{" "}
              {series.genre ?? "-"}
            </p>

            <p className="mt-2">
              <strong>Release Year:</strong>{" "}
              {series.releaseYear ?? "-"}
            </p>

            <p className="mt-2">
              <strong>Created:</strong>{" "}
              {new Date(series.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* HEADER (UNCHANGED) */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Episodes</h2>

        <Link
          href={`/admin/series/${series.id}/episodes/create`}
          className="px-4 py-2 bg-blue-600 rounded-lg"
        >
          + Add Episode
        </Link>
      </div>

      {/* TABLE (UNCHANGED DESIGN) */}
      <div className="bg-[#0B1026] rounded-2xl border border-white/10 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left p-4">Episode</th>
              <th className="text-left p-4">Title</th>
              <th className="text-left p-4">Video</th>
              <th className="text-left p-4">Duration</th>
              <th className="text-left p-4">Created</th>
              <th className="text-left p-4">Actions</th>
            </tr>
          </thead>

          <tbody>
            {series.episodes.map((episode) => (
              <tr key={episode.id} className="border-b border-white/10">
                <td className="p-4">
                  Episode {episode.episodeNo}
                </td>

                <td className="p-4">{episode.title}</td>

                <td className="p-4">
                  {episode.videoUrl ? (
                    <video
                      src={episode.videoUrl}
                      className="w-20 h-12 rounded object-cover cursor-pointer bg-black"
                      muted
                      playsInline
                      preload="metadata"
                      onLoadedData={(e) => {
                        const video = e.currentTarget;
                        video.currentTime = 0.1;
                      }}
                      onClick={() =>
                        window.open(episode.videoUrl!, "_blank")
                      }
                    />
                  ) : (
                    "-"
                  )}
                </td>

                <td className="p-4">{episode.duration} sec</td>

                <td className="p-4">
                  {new Date(episode.createdAt).toLocaleDateString()}
                </td>

                <td className="p-4">
                  <div className="flex gap-2">
                    <Link
                      href={`/admin/episodes/${episode.id}/edit`}
                      className="px-3 py-1 bg-yellow-600 rounded"
                    >
                      Edit
                    </Link>

                    <button className="px-3 py-1 bg-red-600 rounded">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {series.episodes.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-400">
                  No episodes found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ⭐ PAGINATION UI (ADDED ONLY) */}
      <div className="flex gap-2 mt-6 justify-center">
        <button
          className="px-3 py-1 bg-gray-700 rounded disabled:opacity-50"
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
        >
          Prev
        </button>

        <span className="px-3 py-1 text-white">
          Page {page} / {totalPages}
        </span>

        <button
          className="px-3 py-1 bg-gray-700 rounded disabled:opacity-50"
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}