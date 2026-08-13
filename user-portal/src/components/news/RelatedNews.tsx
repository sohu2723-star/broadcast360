"use client";

import Link from "next/link";

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

export default function RelatedNews({
  news,
}: Props) {
  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL || "";

  return (
    <section>
      <h2 className="mb-5 text-2xl font-bold text-white">
        Related News
      </h2>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
              className="group overflow-hidden rounded-xl border border-zinc-800 bg-[#0B1026] transition hover:border-[#106EE9]/50"
            >
              {/* ================================= */}
              {/* THUMBNAIL */}
              {/* ================================= */}

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
                      {item.channel?.name || "News Clip"}
                    </span>
                  </div>
                )}

                {/* ================================= */}
                {/* PLAY BUTTON */}
                {/* ================================= */}

                {videoSrc && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 transition group-hover:bg-black/10">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#106EE9] text-white shadow-lg transition group-hover:scale-110">
                      <span className="ml-0.5 text-xs">
                        ▶
                      </span>
                    </div>
                  </div>
                )}

                {/* ================================= */}
                {/* DURATION */}
                {/* ================================= */}

                {item.duration && item.duration > 0 && (
                  <span className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 font-mono text-[10px] text-zinc-200">
                    {formatDuration(item.duration)}
                  </span>
                )}
              </div>

              {/* ================================= */}
              {/* NEWS INFO */}
              {/* ================================= */}

              <div className="p-4">
                <h3 className="line-clamp-2 font-semibold text-white transition group-hover:text-[#106EE9]">
                  {item.title}
                </h3>

                {item.channel && (
                  <p className="mt-2 text-xs text-zinc-500">
                    {item.channel.name}
                  </p>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}