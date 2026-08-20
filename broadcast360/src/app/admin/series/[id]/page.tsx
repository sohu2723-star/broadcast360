"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Pagination from "@/components/admin/Pagination";

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
  episodeCount?: number;
  partCount?: number;
};

export default function SeriesDetailPage() {
  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return [hrs, mins, secs].map((v) => String(v).padStart(2, "0")).join(":");
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const params = useParams();
  const router = useRouter();
  const id = params?.id ? String(params.id) : null;

  const [series, setSeries] = useState<Series | null>(null);
  const [loading, setLoading] = useState(true);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 5,
    total: 0,
    totalPages: 1,
  });

  const loadSeries = async (pageNum: number) => {
    setLoading(true);

    try {
      const res = await fetch(
        `/api/series/${id}?page=${pageNum}&limit=${pagination.limit}`,
      );

      const result = await res.json();

      setSeries(result.data || null);

      setPagination((prev) => ({
        ...prev,
        page: pageNum,
        totalPages: result.totalPages || 1,
        total: result.total || 0,
      }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!id) return;

    loadSeries(pagination.page);
  }, [pagination.page]);

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

      await loadSeries(pagination.page);
    } catch (error) {
      console.error(error);
      alert("Delete failed");
    }
  };

  if (!id) return <div className="p-6 text-white">Invalid series id</div>;
  if (loading && !series)
    return <div className="p-6 text-white">Loading...</div>;
  if (!series) return <div className="p-6 text-white">No series found</div>;

  const calculatedUniqueEpisodes = series?.episodes
    ? new Set(series.episodes.map((ep) => ep.episodeNo)).size
    : 0;

  const uniqueEpCount = series.episodeCount ?? calculatedUniqueEpisodes;
  const totalPartCount = series.partCount ?? pagination.total;

  return (
    <div className="p-6 text-white">
      {/* Back Button */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => router.push("/admin/series")}
          className="cursor-pointer rounded-xl bg-white/10 px-4 py-2 text-sm font-medium transition hover:bg-white/20"
        >
          ← Back
        </button>
      </div>

      {/* SERIES DETAILS */}
      <div className="w-full rounded-2xl border border-white/10 bg-[#0B1026] p-8">
        <div className="flex flex-row items-start gap-8">
          {/* Widescreen Thumbnail */}
          <div className="relative aspect-[2/3] w-72 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-gray-800 shadow-lg">
            {series?.thumbnail ? (
              <Image
                src={series.thumbnail}
                alt={series.title}
                width={600}
                height={900}
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
                <span className="text-sm font-medium text-white">
                  {uniqueEpCount} Episodes
                </span>
              </div>
            </div>

            <p className="mb-8 text-lg leading-relaxed text-gray-400">
              {series.description}
            </p>

            <div className="mb-8 h-px w-full bg-white/10" />

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
                  {uniqueEpCount}{" "}
                  <span className="text-xs font-normal text-gray-400">
                    ({totalPartCount} Parts)
                  </span>
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
                  {formatDate(series.createdAt)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* EPISODES HEADER */}
      <div className="mt-8 mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Episodes</h2>

        <Link
          href={`/admin/series/${series.id}/episodes/create`}
          className="rounded-lg bg-[#4f6689] px-4 py-2 text-white hover:bg-[#7898bf]/30"
        >
          + Add Episode
        </Link>
      </div>

      {/* EPISODES TABLE */}
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
                <td className="p-4">EP {ep.episodeNo}</td>
                <td className="p-4">{ep.title}</td>
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
                <td className="p-4">{formatDuration(ep.duration)}</td>
                <td className="p-10 text-gray-300">
                  {series.releaseYear || "-"}
                </td>
                <td className="p-4 text-gray-300">
                  {formatDate(ep.createdAt)}
                </td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <Link
                      href={`/admin/series/${series.id}/episodes/edit/${ep.id}`}
                      className="inline-block rounded bg-green-600 px-3 py-1 text-white hover:bg-green-700"
                    >
                      Edit
                    </Link>
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

      {/* PAGINATION  */}
      <Pagination
        page={pagination.page}
        totalPages={pagination.totalPages}
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
