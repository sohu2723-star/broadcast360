"use client";

import { useEffect, useState } from "react";

import {
  getNews,
  getChannels,
  NewsItem,
  Channel,
} from "@/services/news.service";

import NewsSearch from "@/components/news/NewsSearch";
import ChannelFilter from "@/components/news/ChannelFilter";
import NewsCard from "@/components/news/NewsCard";

export default function UserNewsPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [channel, setChannel] = useState("");

  const [currentPage, setCurrentPage] = useState(1);

  const newsPerPage = 6;

  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL || "";

  // =====================================================
  // LOAD NEWS + CHANNELS
  // =====================================================

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        const [newsData, channelData] =
          await Promise.all([
            getNews(),
            getChannels(),
          ]);

        setNews(newsData);

        if (channelData.length > 0) {
          setChannels(channelData);
        } else {
          const extracted = newsData
            .map((item) => item.channel)
            .filter(
              (ch, index, self) =>
                ch &&
                self.findIndex(
                  (c) => c?.id === ch.id
                ) === index
            ) as Channel[];

          setChannels(extracted);
        }
      } catch (err: unknown) {
        console.error(
          "Failed to load news:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load news items"
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // =====================================================
  // SEARCH
  // =====================================================

  function changeSearch(value: string) {
    setSearch(value);
    setCurrentPage(1);
  }

  // =====================================================
  // CHANNEL FILTER
  // =====================================================

  function changeChannel(value: string) {
    setChannel(value);
    setCurrentPage(1);
  }

  // =====================================================
  // FILTER NEWS
  // =====================================================

  const filteredNews = news.filter((item) => {
    const matchSearch = item.title
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchChannel =
      channel === "" ||
      item.channel?.id.toString() === channel;

    return matchSearch && matchChannel;
  });

  // =====================================================
  // HOT NEWS
  // =====================================================

  const hotNews = filteredNews.slice(0, 3);

  // =====================================================
  // PAGINATION
  // =====================================================

  const totalPages = Math.ceil(
    filteredNews.length / newsPerPage
  );

  const startIndex =
    (currentPage - 1) * newsPerPage;

  const paginatedNews = filteredNews.slice(
    startIndex,
    startIndex + newsPerPage
  );

  // =====================================================
  // FORMATTERS
  // =====================================================

  function formatDuration(
    seconds: number | null
  ) {
    if (!seconds) return null;

    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${minutes}:${
      secs < 10 ? "0" : ""
    }${secs}`;
  }

  function formatDate(isoString: string) {
    return new Date(
      isoString
    ).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <main className="min-h-screen bg-dark px-6 py-8 font-sans text-slate-100">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}

        <h1 className="mb-8 text-4xl font-bold tracking-tight text-white">
          NEWS
        </h1>

        {/* SEARCH + FILTER */}

        <div className="mb-8 flex flex-col gap-4 sm:flex-row">
          <div className="flex-1">
            <NewsSearch
              value={search}
              onChange={changeSearch}
            />
          </div>

          <ChannelFilter
            value={channel}
            channels={channels}
            onChange={changeChannel}
          />
        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-8 rounded-xl border border-red-500/40 bg-red-950/40 p-4 text-sm text-red-200">
            {error}
          </div>
        )}

        {/* =====================================================
            HOT NEWS
        ===================================================== */}

        <section className="mb-12">
          <h2 className="mb-5 text-2xl font-bold text-white">
            🔥 HOT NEWS
          </h2>

          {loading ? (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-8 text-center text-sm text-zinc-400">
              Loading news clips...
            </div>
          ) : hotNews.length === 0 ? (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-8 text-center text-sm text-zinc-500">
              No news found.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              {hotNews.map((item) => (
                <NewsCard
                  key={`hot-${item.id}`}
                  item={item}
                  baseUrl={baseUrl}
                  formatDuration={formatDuration}
                  formatDate={formatDate}
                />
              ))}
            </div>
          )}
        </section>

        {/* =====================================================
            RECENT NEWS
        ===================================================== */}

        <section className="mb-16">
          <h2 className="mb-4 text-xl font-bold tracking-tight text-white">
            Recent Broadcasts
          </h2>

          {!loading && (
            <>
              {paginatedNews.length === 0 ? (
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-8 text-center text-sm text-zinc-500">
                  No news matches your search.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {paginatedNews.map((item) => (
                    <NewsCard
                      key={item.id}
                      item={item}
                      baseUrl={baseUrl}
                      formatDuration={formatDuration}
                      formatDate={formatDate}
                    />
                  ))}
                </div>
              )}

              {/* PAGINATION */}

              {totalPages > 1 && (
                <div className="mt-10 flex items-center justify-center gap-3">

                  <button
                    disabled={currentPage === 1}
                    onClick={() =>
                      setCurrentPage(
                        (page) => page - 1
                      )
                    }
                    className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2 text-xs font-semibold text-slate-300 transition hover:border-[#106EE9] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    Previous
                  </button>

                  <span className="text-xs font-medium text-slate-500">
                    {currentPage} / {totalPages}
                  </span>

                  <button
                    disabled={
                      currentPage === totalPages
                    }
                    onClick={() =>
                      setCurrentPage(
                        (page) => page + 1
                      )
                    }
                    className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2 text-xs font-semibold text-slate-300 transition hover:border-[#106EE9] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    Next
                  </button>

                </div>
              )}
            </>
          )}
        </section>

      </div>
    </main>
  );
}