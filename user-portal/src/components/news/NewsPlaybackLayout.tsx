"use client";

import { useState } from "react";

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
  const [currentNews, setCurrentNews] =
    useState<NewsItem>(news);

  return (
    <main className="min-h-screen bg-[#010312] text-white">
      <div className="mx-auto max-w-7xl px-6 py-8">

        {/* BACK */}

        <button
          type="button"
          onClick={() => window.history.back()}
          className="mb-5 inline-flex rounded-full border border-[#106EE9]/30 bg-[#0B1026] px-4 py-2 text-sm transition hover:bg-[#106EE9]/20"
        >
          ← Back to News
        </button>

        {/* VIDEO */}

        <section className="overflow-hidden rounded-xl border border-[#106EE9]/20 bg-[#0B1026] p-4">

          <NewsVideoPlayer
            news={currentNews}
          />

          <div className="mt-5 border-t border-white/10 pt-5">
            <NewsMetadata
              news={currentNews}
            />
          </div>

        </section>

        {/* RELATED */}

        {relatedNews.length > 0 && (
          <section className="mt-12">
            <RelatedNews
              news={relatedNews}
              channelId={currentNews.channel?.id}
            />
          </section>
        )}

      </div>
    </main>
  );
}