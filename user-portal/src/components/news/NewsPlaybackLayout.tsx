"use client";

import { useEffect, useState } from "react";
import type { NewsItem } from "@/services/news.service";

import NewsVideoPlayer from "./NewsVideoPlayer";
import NewsMetadata from "./NewsMetadata";
import RelatedNews from "./RelatedNews";

interface Props {
  news: NewsItem;
  relatedNews: NewsItem[];
}

export default function PlaybackLayout({
  news,
  relatedNews,
}: Props) {
  const [currentNews, setCurrentNews] = useState<NewsItem>(news);

  // Synchronize state when the prop updates
  useEffect(() => {
    setCurrentNews(news);
  }, [news]);

  const hasRelated = relatedNews.length > 0;

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">

        {/* MAIN LAYOUT GRID */}
        <div className="grid gap-6 lg:grid-cols-12 lg:items-start">
          
          {/* LEFT COLUMN: SINGLE CARD WITH PLAYER + METADATA (8 Cols) */}
          <section className="lg:col-span-8 overflow-hidden rounded-2xl border border-white/10 bg-[#0B1026]/80 p-4 sm:p-5 backdrop-blur-sm shadow-xl">
            {/* Player */}
            <NewsVideoPlayer news={currentNews} />

            {/* Divider & Metadata in same card */}
            <div className="mt-5 border-t border-white/10 pt-5">
              <NewsMetadata news={currentNews} />
            </div>
          </section>

          {/* RIGHT COLUMN: STICKY & SCROLLABLE SIDEBAR (4 Cols) */}
          {hasRelated && (
            <aside className="lg:col-span-4 lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] flex flex-col rounded-2xl border border-white/10 bg-[#0B1026]/90 backdrop-blur-md shadow-2xl overflow-hidden">
              
              {/* SIDEBAR HEADER */}
              <div className="border-b border-white/10 bg-black/30 px-5 py-4 flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-200">
                  Related News
                </h2>
                <span className="rounded-full bg-[#106EE9]/20 px-2.5 py-0.5 text-xs text-[#106EE9] font-medium border border-[#106EE9]/30">
                  {relatedNews.length}
                </span>
              </div>

              {/* SCROLLABLE RELATED CONTENT */}
              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar max-h-[600px] lg:max-h-none">
                <RelatedNews
                  news={relatedNews}
                  channelId={currentNews.channel?.id}
                />
              </div>

            </aside>
          )}

        </div>
      </div>
    </main>
  );
}