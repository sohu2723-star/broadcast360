"use client";

import Link from "next/link";
import { Play } from "lucide-react";
import type { NewsItem } from "@/services/news.service";

interface Props {
  news: NewsItem[];
  channelId?: number;
}

function formatDuration(seconds: number | null | undefined) {
  if (!seconds || seconds <= 0) {
    return "00:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  return `${String(minutes).padStart(2, "0")}:${String(
    remainingSeconds
  ).padStart(2, "0")}`;
}

export default function RelatedNews({ news }: Props) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";

  return (
    <div className="flex flex-col gap-3">
      {news.map((item) => {
        const imageSrc = item.image
          ? item.image.startsWith("http")
            ? item.image
            : `${baseUrl}${item.image}`
          : null;

        const videoSrc = item.videoUrl
          ? item.videoUrl.startsWith("http")
            ? item.videoUrl
            : `${baseUrl}${item.videoUrl}`
          : null;

        return (
          <Link
            key={item.id}
            href={`/news/watch/${item.id}`}
            className="group flex gap-3 rounded-xl border border-white/5 bg-[#0B1026]/60 p-2 transition-all hover:border-[#106EE9]/40 hover:bg-[#106EE9]/10"
          >
            {/* THUMBNAIL (LEFT) */}
            <div className="relative aspect-video w-32 sm:w-36 shrink-0 overflow-hidden rounded-lg bg-zinc-950">
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
                <div className="flex h-full w-full items-center justify-center p-1 text-center">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                    {item.channel?.name || "News Clip"}
                  </span>
                </div>
              )}

              {/* PLAY BUTTON OVERLAY */}
              {videoSrc && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition group-hover:bg-black/0">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#106EE9]/90 text-white shadow-md transition group-hover:scale-110">
                    <Play size={11} fill="currentColor" strokeWidth={1.8} aria-hidden="true" />
                  </div>
                </div>
              )}

              {/* DURATION BADGE */}
              {item.duration && item.duration > 0 && (
                <span className="absolute bottom-1 right-1 rounded bg-black/80 px-1 py-0.5 font-mono text-[9px] text-zinc-200">
                  {formatDuration(item.duration)}
                </span>
              )}
            </div>

            {/* DETAILS (RIGHT) */}
            <div className="flex flex-1 flex-col justify-center min-w-0 pr-1">
              <h3 className="line-clamp-2 text-xs font-medium text-zinc-100 leading-snug transition group-hover:text-[#106EE9]">
                {item.title}
              </h3>

              {item.channel && (
                <p className="mt-1 text-[11px] text-zinc-400 truncate">
                  {item.channel.name}
                </p>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}