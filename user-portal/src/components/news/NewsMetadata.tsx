"use client";

import type { NewsItem } from "@/services/news.service";

interface Props {
  news: NewsItem;
}

export default function NewsMetadata({
  news,
}: Props) {
  return (
    <div>
      <h1 className="text-2xl font-bold text-white">
        {news.title}
      </h1>

      <div className="mt-3 flex flex-wrap gap-3 text-sm text-zinc-400">

        {news.channel && (
          <span>
            Channel: {news.channel.name}
          </span>
        )}

        {news.duration && (
          <span>
            Duration:{" "}
            {Math.floor(news.duration / 60)}:
            {(news.duration % 60)
              .toString()
              .padStart(2, "0")}
          </span>
        )}

        <span>
          {new Date(
            news.createdAt
          ).toLocaleDateString()}
        </span>

      </div>

      {news.content && (
        <p className="mt-5 leading-7 text-zinc-300">
          {news.content}
        </p>
      )}
    </div>
  );
}