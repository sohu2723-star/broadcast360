"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Newspaper,
  Plus,
  Play,
  Clock,
  Calendar,
  Radio,
  Video,
  FileVideo2,
} from "lucide-react";

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
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#010312] font-mono text-xs text-[#4f6689] animate-pulse">
        Fetching recorded news telemetry...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#010312] p-4 sm:p-6 text-white font-sans">
      <div className="mx-auto max-w-7xl space-y-4">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-[#4f6689]/10 border border-[#4f6689]/30 text-[#4f6689]">
                <Newspaper size={18} />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-white">
                News Management
              </h1>
              <span className="rounded bg-[#4f6689]/10 border border-[#4f6689]/20 px-2 py-0.5 font-mono text-[10px] font-bold text-[#4f6689]">
                {news.length} ITEMS
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Manage recorded live broadcasts, bulletins, and news clips
            </p>
          </div>

          <Link href="/admin/news/create" className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#4f6689] to-[#400FD3] px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-[#400FD3]/20 transition-all hover:opacity-90 active:scale-95">
            <Plus size={16} />
            Create News
          </Link>
        </div>

        {/* Data Table */}
        <div className="overflow-hidden rounded-xl border border-white/10 bg-[#0B1026] shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/10 bg-[#010312]/60 text-zinc-400 uppercase tracking-wider font-mono">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">ID</th>
                  <th className="py-3.5 px-4 font-semibold">Title</th>
                  <th className="py-3.5 px-4 font-semibold">Broadcast Type</th>
                  <th className="py-3.5 px-4 font-semibold">Duration</th>
                  <th className="py-3.5 px-4 font-semibold">Created Date</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/5 text-zinc-300">
                {news.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-zinc-500">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <FileVideo2 size={32} className="text-zinc-600" />
                        <p className="text-xs font-medium">No news assets available</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  news.map((item) => (
                    <tr
                      key={item.id}
                      className="transition-colors hover:bg-[#4f6689]/5"
                    >
                      {/* ID */}
                      <td className="py-3.5 px-4 font-mono text-[11px] text-zinc-400 font-bold">
                        #{item.id}
                      </td>

                      {/* Title */}
                      <td className="py-3.5 px-4 font-semibold text-white">
                        <div className="flex items-center gap-2">
                          <Radio size={14} className="text-[#4f6689] shrink-0" />
                          <span className="truncate max-w-xs">{item.title}</span>
                        </div>
                      </td>

                      {/* Type Pill */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 rounded-md border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 text-[10px] font-bold text-rose-400 uppercase font-mono">
                          <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
                          {item.type}
                        </span>
                      </td>

                      {/* Duration */}
                      <td className="py-3.5 px-4 font-mono text-zinc-300">
                        {item.duration ? (
                          <span className="inline-flex items-center gap-1 text-zinc-300">
                            <Clock size={12} className="text-zinc-500" />
                            {`${Math.floor(item.duration / 60)}m ${
                              item.duration % 60
                            }s`}
                          </span>
                        ) : (
                          <span className="text-zinc-600">-</span>
                        )}
                      </td>

                      {/* Created Date */}
                      <td className="py-3.5 px-4 font-mono text-[11px] text-zinc-400">
                        <span className="inline-flex items-center gap-1">
                          <Calendar size={12} className="text-zinc-500" />
                          {new Date(item.createdAt).toLocaleString(undefined, {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-center">
                        {item.videoUrl ? (
                          <Link href={`/admin/news/${item.id}`} className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-[11px] font-semibold text-emerald-400 hover:bg-emerald-500/20 transition-all">
                            <Play size={12} className="fill-current" />
                            View
                          </Link>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-zinc-600 italic">
                            <Video size={12} /> No Media
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}