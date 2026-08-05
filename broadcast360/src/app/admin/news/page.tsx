"use client";

import { useEffect, useState } from "react";

interface News {
  id: number;
  title: string;
  videoUrl: string | null;
  duration: number | null;
  type: string;
  createdAt: string;
}

export default function NewsPage() {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadNews() {
    try {
      const res = await fetch("/api/news");

      const data = await res.json();

      setNews(data);
    } catch (error) {
      console.error("Failed loading news", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNews();
  }, []);

  if (loading) {
    return <div className="p-6 text-slate-300">Loading news...</div>;
  }

  return (
    <div className="min-h-screen space-y-6 bg-[#020617] p-6 text-slate-100">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">News Management</h1>

          <p className="mt-1 text-sm text-slate-400">
            Manage recorded live news content
          </p>
        </div>

        <button className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-500">
          Create News
        </button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-800 bg-[#0f172a] shadow-lg">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-800 bg-[#111827] text-slate-400">
            <tr>
              <th className="p-4 text-left">ID</th>

              <th className="p-4 text-left">Title</th>

              <th className="p-4 text-left">Type</th>

              <th className="p-4 text-left">Duration</th>

              <th className="p-4 text-left">Created</th>

              <th className="p-4 text-center">Action</th>
            </tr>
          </thead>

          <tbody>
            {news.map((item) => (
              <tr
                key={item.id}
                className="border-b border-slate-800 transition hover:bg-slate-800/50"
              >
                <td className="p-4 text-slate-400">{item.id}</td>

                <td className="p-4 font-medium text-white">{item.title}</td>

                <td className="p-4">
                  <span className="rounded-full bg-red-500/20 px-3 py-1 text-xs font-medium text-red-400">
                    {item.type}
                  </span>
                </td>

                <td className="p-4 text-slate-300">
                  {item.duration
                    ? `${Math.floor(item.duration / 60)}m ${
                        item.duration % 60
                      }s`
                    : "-"}
                </td>

                <td className="p-4 text-slate-400">
                  {new Date(item.createdAt).toLocaleString()}
                </td>

                <td className="space-x-2 p-4 text-center">
                  {item.videoUrl && (
                    <button
                      onClick={() => {
                        window.open(item.videoUrl!, "_blank");
                      }}

                      className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-emerald-500"
                    >
                      Watch
                    </button>
                  )}

                  {/* <button className="rounded-lg bg-slate-700 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:bg-slate-600">
                    Add Playlist
                  </button> */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
