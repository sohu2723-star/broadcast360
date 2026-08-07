"use client";

import React, { useEffect, useState } from "react";
import { getNews, getChannels, NewsItem, Channel } from "@/services/news.service";

/* Modular News Search Input */
function NewsSearch({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) {
  return (
    <div className="relative w-full">
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search news by title..."
        className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-12 py-3 text-white outline-none focus:border-[#106EE9]"
      />
      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
        
      </span>
    </div>
  );
}

/* Modular Channel Filter Dropdown */
function ChannelFilter({
  value,
  channels,
  onChange,
}: {
  value: string;
  channels: Channel[];
  onChange: (val: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-[#106EE9]"
    >
      <option value="">All Channels</option>
      {channels.map((ch) => (
        <option key={ch.id} value={ch.id.toString()}>
          {ch.name}
        </option>
      ))}
    </select>
  );
}

export default function UserNewsPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState<string>("");
  const [channel, setChannel] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [activeMedia, setActiveMedia] = useState<NewsItem | null>(null);

  const newsPerPage = 6;
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [newsData, channelData] = await Promise.all([
          getNews(),
          getChannels(),
        ]);

        setNews(newsData);

        if (channelData.length > 0) {
          setChannels(channelData);
        } else {
          const extracted = newsData
            .map((item) => item.channel)
            .filter((ch, idx, self) => ch && self.findIndex((c) => c?.id === ch.id) === idx) as Channel[];
          setChannels(extracted);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load news items");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const changeSearch = (val: string) => {
    setSearch(val);
    setCurrentPage(1);
  };

  const changeChannel = (val: string) => {
    setChannel(val);
    setCurrentPage(1);
  };

  const getFullUrl = (url: string | null) => {
    if (!url) return null;
    return url.startsWith("http") ? url : `${baseUrl}${url}`;
  };

  const filteredNews = news.filter((item) => {
    const matchSearch = item.title.toLowerCase().includes(search.toLowerCase());
    const matchChannel = channel === "" || item.channel?.id.toString() === channel;
    return matchSearch && matchChannel;
  });

  const hotNews = filteredNews.slice(0, 3);
  const totalPages = Math.ceil(filteredNews.length / newsPerPage);
  const paginatedNews = filteredNews.slice((currentPage - 1) * newsPerPage, currentPage * newsPerPage);

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return null;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <main className="min-h-screen bg-[#070d19] px-6 py-8 font-sans text-slate-100">
      <div className="mx-auto max-w-7xl">
        
        {/* Main News Header */}
        <h1 className="mb-8 text-4xl font-bold tracking-tight text-white">NEWS</h1>

        {/* Search + Channel Filter Controls */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row">
          <div className="flex-1">
            <NewsSearch value={search} onChange={changeSearch} />
          </div>
          <div>
            <ChannelFilter value={channel} channels={channels} onChange={changeChannel} />
          </div>
        </div>

        {error && (
          <div className="mb-8 rounded-xl border border-red-500/40 bg-red-950/40 p-4 text-sm text-red-200">
            {error}
          </div>
        )}

        {/* Hot Highlights Section */}
        <section className="mb-12">
          <h2 className="mb-5 text-2xl font-bold text-white">
           🔥HOT NEWS
          </h2>

          {loading ? (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-8 text-center text-sm text-zinc-400">
              Loading news clips...
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              {hotNews.map((item) => (
                <NewsCard
                  key={`hot-${item.id}`}
                  item={item}
                  baseUrl={baseUrl}
                  onPlay={setActiveMedia}
                  formatDuration={formatDuration}
                  formatDate={formatDate}
                />
              ))}
            </div>
          )}
        </section>

        {/* All News Archive */}
        <section className="mb-16">
          <h2 className="mb-4 text-xl font-bold tracking-tight text-white">
            Recent Broadcasts
          </h2>

          {!loading && (
            <>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                {paginatedNews.map((item) => (
                  <NewsCard
                    key={item.id}
                    item={item}
                    baseUrl={baseUrl}
                    onPlay={setActiveMedia}
                    formatDuration={formatDuration}
                    formatDate={formatDate}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-10 flex items-center justify-center gap-3">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                    className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2 text-xs font-semibold text-slate-300 transition hover:border-[#106EE9] hover:text-white disabled:opacity-30"
                  >
                    Previous
                  </button>
                  <span className="text-xs font-medium text-slate-500">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => p + 1)}
                    className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2 text-xs font-semibold text-slate-300 transition hover:border-[#106EE9] hover:text-white disabled:opacity-30"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>

      {/* Video Modal Player */}
      {activeMedia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
          <div className="w-full max-w-4xl overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
            <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-3">
              <h3 className="line-clamp-1 text-sm font-semibold text-white">{activeMedia.title}</h3>
              <button
                onClick={() => setActiveMedia(null)}
                className="text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="aspect-video bg-black">
              {activeMedia.videoUrl ? (
                <video
                  src={getFullUrl(activeMedia.videoUrl)!}
                  controls
                  autoPlay
                  className="h-full w-full"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-zinc-500">
                  Media file unavailable
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function NewsCard({
  item,
  baseUrl,
  onPlay,
  formatDuration,
  formatDate,
}: {
  item: NewsItem;
  baseUrl: string;
  onPlay: (item: NewsItem) => void;
  formatDuration: (sec: number | null) => string | null;
  formatDate: (iso: string) => string;
}) {
  const getFullUrl = (url: string | null) => {
    if (!url) return undefined;
    return url.startsWith("http") ? url : `${baseUrl}${url}`;
  };

  const imageSrc = getFullUrl(item.image);
  const videoSrc = getFullUrl(item.videoUrl);

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 transition hover:border-zinc-700">
      
      {/* Thumbnail Area */}
      <div className="relative aspect-video w-full overflow-hidden bg-zinc-950">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={item.title}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : videoSrc ? (
          <video
            src={`${videoSrc}#t=0.5`}
            preload="metadata"
            muted
            playsInline
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-zinc-950">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              {item.channel?.name || "News Clip"}
            </span>
          </div>
        )}

        {/* Play Overlay */}
        {item.videoUrl && (
          <button
            onClick={() => onPlay(item)}
            className="absolute inset-0 flex items-center justify-center bg-black/30 transition group-hover:bg-black/10"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#106EE9] text-white shadow-lg transition group-hover:scale-110">
              <span className="ml-0.5 text-xs">▶</span>
            </div>
          </button>
        )}

        {/* Duration Badge */}
        {item.duration && (
          <span className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 font-mono text-[10px] text-zinc-200">
            {formatDuration(item.duration)}
          </span>
        )}
      </div>

      {/* Card Content */}
      <div className="flex flex-1 flex-col justify-between p-4">
        <h3 className="line-clamp-2 text-sm font-bold leading-snug text-white transition group-hover:text-[#106EE9]">
          {item.title}
        </h3>

        <div className="mt-3 flex items-center justify-between border-t border-zinc-800 pt-3 text-[11px] text-zinc-500">
          <span>{formatDate(item.createdAt)}</span>
          {item.channel && (
            <span className="font-semibold text-zinc-400">{item.channel.name}</span>
          )}
        </div>
      </div>
    </article>
  );
}