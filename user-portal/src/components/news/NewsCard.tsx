"use client";

import Link from "next/link";
import { Play } from "lucide-react";

import type { NewsItem } from "@/services/news.service";

interface Props {
  item: NewsItem;
  baseUrl: string;
  formatDuration: (
    seconds: number | null
  ) => string | null;
  formatDate: (iso: string) => string;
}

export default function NewsCard({
  item,
  baseUrl,
  formatDuration,
  formatDate,
}: Props) {
  const getFullUrl = (
    url: string | null
  ) => {
    if (!url) return null;

    return url.startsWith("http")
      ? url
      : `${baseUrl}${url}`;
  };

  const imageSrc = getFullUrl(item.image);
  const videoSrc = getFullUrl(item.videoUrl);

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 transition hover:border-zinc-700">

      {/* THUMBNAIL */}

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
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              {item.channel?.name ||
                "News Clip"}
            </span>
          </div>
        )}

        {/* PLAY */}

        {item.videoUrl && (
          <Link
            href={`/news/watch/${item.id}`}
            className="absolute inset-0 flex items-center justify-center bg-black/30 transition group-hover:bg-black/10"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#106EE9] text-white shadow-lg transition group-hover:scale-110">
              <span className="ml-0.5 text-xs">
                <Play size={14} fill="currentColor" strokeWidth={1.8} aria-hidden="true" />
              </span>
            </div>
          </Link>
        )}

        {/* DURATION */}

        {item.duration && (
          <span className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 font-mono text-[10px] text-zinc-200">
            {formatDuration(item.duration)}
          </span>
        )}
      </div>

      {/* CONTENT */}

      <Link
        href={`/news/watch/${item.id}`}
        className="flex flex-1 flex-col justify-between p-4"
      >
        <h3 className="line-clamp-2 text-sm font-bold leading-snug text-white transition group-hover:text-[#106EE9]">
          {item.title}
        </h3>

        <div className="mt-3 flex items-center justify-between border-t border-zinc-800 pt-3 text-[11px] text-zinc-500">
          <span>
            {formatDate(item.createdAt)}
          </span>

          {item.channel && (
            <span className="font-semibold text-zinc-400">
              {item.channel.name}
            </span>
          )}
        </div>
      </Link>

    </article>
  );
}