"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";

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

export default function SeriesDetailPage() {
  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return [hrs, mins, secs].map((v) => String(v).padStart(2, "0")).join(":");
  };

  const params = useParams();
  const id = params?.id ? String(params.id) : null;

  const [series, setSeries] = useState<Series | null>(null);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEpisodes, setTotalEpisodes] = useState(0);

  const limit = 5;

  const loadSeries = async (pageNum: number) => {
    setLoading(true);

    try {
      const res = await fetch(
        `/api/series/${id}?page=${pageNum}&limit=${limit}`,
      );

      const result = await res.json();

      setSeries(result.data || null);
      setTotalPages(result.totalPages || 1);
      setTotalEpisodes(result.total || 0);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (!id) return;

    loadSeries(page);
  }, [page]);

  const handleDelete = async (episodeId: number) => {
    if (!id) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this episode?",
    );
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/episodes/${episodeId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Delete failed");

      // IMPORTANT: reload AFTER delete (safe)
      await loadSeries(page);
    } catch (error) {
      console.error(error);
      alert("Delete failed");
    }
  };

  if (!id) return <div className="p-6 text-white">Invalid series id</div>;
  if (loading) return <div className="p-6 text-white">Loading...</div>;
  if (!series) return <div className="p-6 text-white">No series found</div>;

  return (
    <div className="p-6 text-white">
      {/* SERIES DETAILS */}
      {/* SERIES DETAILS */}
      <div className="w-full rounded-2xl border border-white/10 bg-[#0B1026] p-8">
        <div className="flex flex-row items-start gap-8">
          {/* Widescreen Thumbnail */}
          <div className="h-87.5 w-112.5 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-gray-800 shadow-lg">
            {series?.thumbnail ? (
              <Image
                src={series.thumbnail}
                alt={series.title}
                width={450}
                height={350}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-gray-500">
                No Image
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="flex-1">
            <h1 className="mb-6 text-4xl font-bold text-white">
              {series.title}
            </h1>

            {/* Top Pills */}
            <div className="mb-6 flex gap-3">
              <div className="flex items-center gap-2 rounded border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-400">
                <span>{series.genre}</span>
              </div>
              <div className="flex items-center gap-2 rounded border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
                <span>{series.releaseYear}</span>
              </div>
              <div className="flex items-center gap-2 rounded border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-400">
                <span>{totalEpisodes} Episodes</span>
              </div>
            </div>

            <p className="mb-8 text-lg leading-relaxed text-gray-400">
              {series.description}
            </p>

            <div className="mb-8 h-px w-full bg-white/10" />

            {/* Metadata Grid */}
            {/* Metadata Grid */}
            <div className="grid grid-cols-4 gap-4">
              {/* Genre */}
              <div className="flex flex-col items-center border-r border-white/5 last:border-r-0">
                <svg
                  className="mb-2 h-5 w-5 text-indigo-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M7 4v16M17 4v16M3 8h18M3 16h18"
                  />
                </svg>
                <span className="text-[10px] font-bold tracking-widest text-gray-500">
                  GENRE
                </span>
                <span className="text-sm font-medium text-white">
                  {series.genre}
                </span>
              </div>

              {/* Released */}
              <div className="flex flex-col items-center border-r border-white/5 last:border-r-0">
                <svg
                  className="mb-2 h-5 w-5 text-emerald-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span className="text-[10px] font-bold tracking-widest text-gray-500">
                  RELEASED
                </span>
                <span className="text-sm font-medium text-white">
                  {series.releaseYear}
                </span>
              </div>

              {/* Episodes */}
              <div className="flex flex-col items-center border-r border-white/5 last:border-r-0">
                <svg
                  className="mb-2 h-5 w-5 text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <span className="text-[10px] font-bold tracking-widest text-gray-500">
                  EPISODES
                </span>
                <span className="text-sm font-medium text-white">
                  {totalEpisodes}
                </span>
              </div>

              {/* Created */}
              <div className="flex flex-col items-center border-r border-white/5 last:border-r-0">
                <svg
                  className="mb-2 h-5 w-5 text-amber-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-[10px] font-bold tracking-widest text-gray-500">
                  CREATED
                </span>
                <span className="text-sm font-medium text-white">
                  {new Date(series.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* EPISODES */}
      <div className="mt-8 mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Episodes</h2>

        <Link
          href={`/admin/series/${series.id}/episodes/create`}
          className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          + Add Episode
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-white/10 bg-[#0B1026]">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="p-4 text-left">Episode</th>
              <th className="p-4 text-left">Title</th>
              <th className="p-4 text-left">Thumbnail</th>
              <th className="p-4 text-left">Duration</th>
              <th className="p-4 text-left">Release Year</th>
              <th className="p-4 text-left">Created Date</th>
              <th className="p-4 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {series.episodes.map((ep) => (
              <tr key={ep.id} className="border-b border-white/10">
                {/* Episode No */}
                <td className="p-4">EP {ep.episodeNo}</td>

                {/* Title */}
                <td className="p-4">{ep.title}</td>

                {/* Thumbnail */}
                <td className="p-4">
                  {ep.thumbnailUrl ? (
                    <div className="flex flex-col gap-2">
                      <Link href={`/admin/series/${id}/episodes/${ep.id}`}>
                        <Image
                          src={ep.thumbnailUrl}
                          alt={ep.title}
                          width={96}
                          height={56}
                          className="h-14 w-24 cursor-pointer rounded object-cover hover:opacity-80"
                        />
                      </Link>

                      <Link
                        href={`/admin/series/${id}/episodes/${ep.id}`}
                        className="text-xs text-blue-400 hover:underline"
                      >
                        Watch Episode
                      </Link>
                    </div>
                  ) : (
                    <span className="text-gray-400">No Thumbnail</span>
                  )}
                </td>

                {/* Duration */}
                <td className="p-4">{formatDuration(ep.duration)}</td>

                {/* Release Year (FROM SERIES) */}
                <td className="p-4 text-gray-300">
                  {series.releaseYear || "-"}
                </td>

                {/* Created Date */}
                <td className="p-4 text-gray-300">
                  {new Date(ep.createdAt).toLocaleDateString()}
                </td>

                {/* Actions */}
                <td className="p-4">
                  <div className="flex gap-2">
                    {/* EDIT */}
                    <Link
                      href={`/admin/series/${series.id}/episodes/edit/${ep.id}`}
                      className="inline-block rounded bg-green-600 px-3 py-1 text-white hover:bg-green-700"
                    >
                      Edit
                    </Link>

                    {/* DELETE */}
                    <button
                      onClick={() => handleDelete(ep.id)}
                      className="rounded bg-red-600 px-3 py-1 text-white hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {series.episodes.length === 0 && (
              <tr>
                <td colSpan={7} className="p-6 text-center text-gray-400">
                  No episodes found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="mt-6 flex justify-center gap-3">
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
          className="rounded bg-gray-700 px-4 py-2 disabled:opacity-50"
        >
          Prev
        </button>

        <span>
          Page {page} of {totalPages}
        </span>

        <button
          disabled={page === totalPages}
          onClick={() => setPage((p) => p + 1)}
          className="rounded bg-gray-700 px-4 py-2 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
