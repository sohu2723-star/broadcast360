"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

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
  const params = useParams();
  const id = params?.id ? String(params.id) : null;

  const [series, setSeries] = useState<Series | null>(null);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEpisodes, setTotalEpisodes] = useState(0);


  const limit = 5;

  const loadSeries = async (seriesId: string, pageNum: number) => {
    try {
      setLoading(true);

      const res = await fetch(
        `/api/series/${seriesId}?page=${pageNum}&limit=${limit}`
      );

      if (!res.ok) throw new Error("Failed to fetch series");

      const result = await res.json();

      setSeries(result.data || null);
      setTotalPages(result.totalPages || 1);
      setTotalEpisodes(result.total || 0);
    } catch (error) {
      console.error(error);
      setSeries(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    loadSeries(id, page);
  }, [id, page]);

  const handleDelete = async (episodeId: number) => {
    if (!id) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this episode?"
    );
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/episodes/${episodeId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Delete failed");

      await loadSeries(id, page);
    } catch (error) {
      console.error(error);
      alert("Delete failed");
    }
  };

  if (!id) return <div className="text-white p-6">Invalid series id</div>;
  if (loading) return <div className="text-white p-6">Loading...</div>;
  if (!series) return <div className="text-white p-6">No series found</div>;

  return (
    <div className="text-white p-6">

      {/* SERIES DETAILS */}
      {/* SERIES DETAILS */}
      <div className="bg-[#0B1026] rounded-2xl p-8 w-full border border-white/10">
        <div className="flex flex-row gap-8 items-start">

          {/* Widescreen Thumbnail */}
          <div className="w-[450px] h-[350px] flex-shrink-0 bg-gray-800 rounded-xl overflow-hidden border border-white/10 shadow-lg">
            {series?.thumbnail ? (
              <img src={series.thumbnail} alt={series.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">No Image</div>
            )}
          </div>

          {/* Details Section */}
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-white mb-6">{series.title}</h1>

            {/* Top Pills */}
            <div className="flex gap-3 mb-6">
              <div className="flex items-center gap-2 px-3 py-1 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-medium">
                <span>{series.genre}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-medium">
                <span>{series.releaseYear}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-medium">
                <span>{totalEpisodes} Episodes</span>
              </div>
            </div>

            <p className="text-gray-400 text-lg leading-relaxed mb-8">{series.description}</p>

            <div className="w-full h-px bg-white/10 mb-8" />

            {/* Metadata Grid */}
            {/* Metadata Grid */}
            <div className="grid grid-cols-4 gap-4">
              {/* Genre */}
              <div className="flex flex-col items-center border-r border-white/5 last:border-r-0">
                <svg className="w-5 h-5 text-indigo-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 4v16M17 4v16M3 8h18M3 16h18" /></svg>
                <span className="text-gray-500 text-[10px] font-bold tracking-widest">GENRE</span>
                <span className="text-white text-sm font-medium">{series.genre}</span>
              </div>

              {/* Released */}
              <div className="flex flex-col items-center border-r border-white/5 last:border-r-0">
                <svg className="w-5 h-5 text-emerald-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                <span className="text-gray-500 text-[10px] font-bold tracking-widest">RELEASED</span>
                <span className="text-white text-sm font-medium">{series.releaseYear}</span>
              </div>

              {/* Episodes */}
              <div className="flex flex-col items-center border-r border-white/5 last:border-r-0">
                <svg className="w-5 h-5 text-blue-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                <span className="text-gray-500 text-[10px] font-bold tracking-widest">EPISODES</span>
                <span className="text-white text-sm font-medium">{totalEpisodes}</span>
              </div>

              {/* Created */}
              <div className="flex flex-col items-center border-r border-white/5 last:border-r-0">
                <svg className="w-5 h-5 text-amber-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span className="text-gray-500 text-[10px] font-bold tracking-widest">CREATED</span>
                <span className="text-white text-sm font-medium">
                  {new Date(series.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* EPISODES */}
      <h2 className="text-2xl font-semibold mb-4">Episodes</h2>

      <div className="bg-[#0B1026] rounded-xl overflow-hidden border border-white/10">
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
                        <img
                          src={ep.thumbnailUrl}
                          alt={ep.title}
                          className="w-24 h-14 object-cover rounded cursor-pointer hover:opacity-80"
                        />
                      </Link>

                      <Link
                        href={`/admin/series/${id}/episodes/${ep.id}`}
                        className="text-blue-400 text-xs hover:underline"
                      >
                        Watch Episode
                      </Link>
                    </div>
                  ) : (
                    <span className="text-gray-400">No Thumbnail</span>
                  )}
                </td>

                {/* Duration */}
                <td className="p-4">{ep.duration}s</td>

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
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded inline-block"
                    >
                      Edit
                    </Link>

                    {/* DELETE */}
                    <button
                      onClick={() => handleDelete(ep.id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                    >
                      Delete
                    </button>

                  </div>
                </td>

              </tr>
            ))}

            {series.episodes.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center p-6 text-gray-400">
                  No episodes found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="flex justify-center gap-3 mt-6">

        <button
          disabled={page === 1}
          onClick={() => setPage(p => p - 1)}
          className="px-4 py-2 bg-gray-700 rounded disabled:opacity-50"
        >
          Prev
        </button>

        <span>
          Page {page} of {totalPages}
        </span>

        <button
          disabled={page === totalPages}
          onClick={() => setPage(p => p + 1)}
          className="px-4 py-2 bg-gray-700 rounded disabled:opacity-50"
        >
          Next
        </button>

      </div>

    </div>
  );
}