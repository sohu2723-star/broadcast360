"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import authApi from "@/lib/authapi";

interface HistoryItem {
  id: number;
  progressSeconds: number;
  durationSeconds: number | null;
  watchedAt: string;

  // =====================================================
  // NEWS
  // =====================================================

  news?: {
    id: number;
    title: string;
    image: string | null;
    videoUrl: string | null;
    duration: number | null;

    channel?: {
      id?: number;
      name: string;
    } | null;
  } | null;

  // =====================================================
  // PLAYLIST ITEM
  // =====================================================

  playlistItem?: {
    id: number;

    playlist?: {
      id: number;
      name: string;
    } | null;

    // ===================================================
    // MOVIE
    // ===================================================

    movie?: {
      id: number;
      title: string;
      image?: string | null;
      poster?: string | null;
      thumbnail?: string | null;
      videoUrl?: string | null;
      duration?: number | null;
    } | null;

    // ===================================================
    // EPISODE
    // ===================================================

    episode?: {
      id: number;
      title: string;

      thumbnail?: string | null;

      videoUrl?: string | null;

      duration?: number | null;

      parts?: {
        id: number;
        thumbnail?: string | null;
        videoUrl?: string | null;
      }[];

      series?: {
        id: number;
        title: string;
      } | null;
    } | null;

    // ===================================================
    // ENTERTAINMENT
    // ===================================================

    entertainment?: {
      id: number;
      title: string;

      image?: string | null;
      thumbnail?: string | null;

      videoUrl?: string | null;

      duration?: number | null;
    } | null;
  } | null;
}

type HistoryContentType =
  | "NEWS"
  | "MOVIE"
  | "EPISODE"
  | "ENTERTAINMENT"
  | "UNKNOWN";

export default function WatchHistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [deletingId, setDeletingId] = useState<number | null>(
    null
  );

  const [clearingAll, setClearingAll] = useState(false);

  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL || "";

  // =====================================================
  // URL HELPER
  // =====================================================

  const getUrl = (
    value?: string | null
  ): string | null => {
    if (!value) {
      return null;
    }

    if (
      value.startsWith("http://") ||
      value.startsWith("https://")
    ) {
      return value;
    }

    if (value.startsWith("/")) {
      return `${baseUrl}${value}`;
    }

    return `${baseUrl}/${value}`;
  };

  // =====================================================
  // FORMAT DURATION
  // =====================================================

  const formatDuration = (
    seconds?: number | null
  ): string => {
    if (
      seconds === null ||
      seconds === undefined ||
      !Number.isFinite(seconds) ||
      seconds <= 0
    ) {
      return "00:00";
    }

    const hours = Math.floor(seconds / 3600);

    const minutes = Math.floor(
      (seconds % 3600) / 60
    );

    const remainingSeconds = Math.floor(
      seconds % 60
    );

    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(
        2,
        "0"
      )}:${String(remainingSeconds).padStart(
        2,
        "0"
      )}`;
    }

    return `${String(minutes).padStart(
      2,
      "0"
    )}:${String(remainingSeconds).padStart(
      2,
      "0"
    )}`;
  };

  // =====================================================
  // PROGRESS
  // =====================================================

  const getProgress = (
    item: HistoryItem
  ): number => {
    if (
      !item.durationSeconds ||
      item.durationSeconds <= 0
    ) {
      return 0;
    }

    return Math.min(
      100,
      Math.max(
        0,
        Math.round(
          (item.progressSeconds /
            item.durationSeconds) *
          100
        )
      )
    );
  };

  // =====================================================
  // LOAD HISTORY
  // =====================================================

  useEffect(() => {
    let mounted = true;

    async function loadHistory() {
      try {
        const response = await authApi.get(
          "/api/user-portal/auth/history"
        );

        if (!mounted) {
          return;
        }

        const data =
          response.data?.history;

        setHistory(
          Array.isArray(data) ? data : []
        );
      } catch (error) {
        console.error(
          "Failed to load watch history:",
          error
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadHistory();

    return () => {
      mounted = false;
    };
  }, []);

  // =====================================================
  // DELETE ONE
  // =====================================================

  const handleClearItem = async (
    e: React.MouseEvent<HTMLButtonElement>,
    id: number
  ) => {
    e.preventDefault();
    e.stopPropagation();

    if (deletingId !== null) {
      return;
    }

    setDeletingId(id);

    try {
      await authApi.delete(
        `/api/user-portal/auth/history/${id}`
      );

      setHistory((prev) =>
        prev.filter(
          (item) => item.id !== id
        )
      );
    } catch (error) {
      console.error(
        "Failed to delete history item:",
        error
      );
    } finally {
      setDeletingId(null);
    }
  };

  // =====================================================
  // CLEAR ALL
  // =====================================================

  const handleClearAll = async () => {
    if (
      clearingAll ||
      history.length === 0
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        "Are you sure you want to clear your entire watch history?"
      );

    if (!confirmed) {
      return;
    }

    setClearingAll(true);

    try {
      await authApi.delete(
        "/api/user-portal/auth/history"
      );

      setHistory([]);
    } catch (error) {
      console.error(
        "Failed to clear watch history:",
        error
      );
    } finally {
      setClearingAll(false);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#010312] px-4 py-8 text-white sm:px-8">
        <div className="mx-auto max-w-5xl">

          <div className="mb-8 border-b border-white/10 pb-5">
            <div className="h-8 w-48 animate-pulse rounded bg-white/10" />

            <div className="mt-2 h-4 w-72 animate-pulse rounded bg-white/10" />
          </div>

          <div className="flex flex-col gap-6">
            {[1, 2, 3, 4, 5].map(
              (index) => (
                <div
                  key={index}
                  className="flex flex-col gap-4 sm:flex-row"
                >
                  <div className="aspect-video w-full animate-pulse rounded-xl bg-white/10 sm:w-56 md:w-64" />

                  <div className="flex-1 space-y-3">
                    <div className="h-5 w-2/3 animate-pulse rounded bg-white/10" />

                    <div className="h-4 w-1/3 animate-pulse rounded bg-white/10" />

                    <div className="h-3 w-1/4 animate-pulse rounded bg-white/10" />
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="min-h-screen bg-[#010312] px-4 py-8 text-white sm:px-8">
      <div className="mx-auto max-w-5xl">

        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <div className="mb-8 flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Watch History
            </h1>

            <p className="mt-1 text-sm text-zinc-400">
              Continue watching videos you've started.
            </p>
          </div>

          <div className="flex items-center gap-3">

            {history.length > 0 && (
              <button
                onClick={handleClearAll}
                disabled={clearingAll}
                className="rounded-full border border-zinc-700 bg-zinc-900 px-4 py-2 text-xs font-medium text-zinc-300 transition hover:bg-zinc-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
              >
                {clearingAll
                  ? "Clearing..."
                  : "Clear all"}
              </button>
            )}

            <Link
              href="/profile"
              className="rounded-full bg-white/10 px-4 py-2 text-xs font-medium text-white transition hover:bg-white/20 sm:text-sm"
            >
              Back
            </Link>
          </div>
        </div>

        {/* ================================================= */}
        {/* EMPTY */}
        {/* ================================================= */}

        {history.length === 0 ? (
          <div className="flex min-h-[400px] flex-col items-center justify-center text-center">

            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-white/5 text-4xl">
              ▶
            </div>

            <h2 className="text-xl font-semibold">
              No watch history
            </h2>

            <p className="mt-2 max-w-sm text-sm text-zinc-500">
              Videos you watch will appear here
              so you can easily continue watching
              them later.
            </p>

            <Link
              href="/"
              className="mt-6 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
            >
              Browse videos
            </Link>
          </div>
        ) : (

          /* ================================================= */
          /* HISTORY */
          /* ================================================= */

          <div className="flex flex-col gap-5">

            {history.map((item) => {
              const news = item.news;
              const playlistItem = item.playlistItem;

              let title = "Video";
              let image: string | null = null;
              let videoUrl: string | null = null;
              let href: string | null = null;

              let typeLabel = "Media";
              let badgeColor = "bg-blue-600";
              let subText = "";

              let contentType: HistoryContentType = "UNKNOWN";

              // =====================================================
              // NEWS
              // =====================================================

              if (news) {
                contentType = "NEWS";

                title = news.title;

                image = news.image ?? null;
                videoUrl = news.videoUrl ?? null;

                href = news.id
                  ? `/news/watch/${news.id}`
                  : null;

                typeLabel = "News";
                badgeColor = "bg-red-600";

                subText =
                  news.channel?.name ||
                  "News Channel";
              }

              else if (playlistItem) {
                const movie = playlistItem.movie;
                const episode = playlistItem.episode;
                const entertainment = playlistItem.entertainment;
                const playlist = playlistItem.playlist;

                // =====================================================
                // MOVIE
                // =====================================================

                if (movie) {
                  contentType = "MOVIE";

                  title = movie.title;

                  image =
                    movie.thumbnail ??
                    movie.poster ??
                    movie.image ??
                    null;

                  videoUrl = movie.videoUrl ?? null;

                  typeLabel = "Movie";
                  badgeColor = "bg-blue-600";

                  // Playlist ID, NOT movie ID
                  if (playlist?.id) {
                    href = `/movies/watch/${movie.id}`;
                  }

                  subText = playlist?.name ?? "";
                }

                // =====================================================
                // EPISODE
                // =====================================================

                else if (episode) {
                  contentType = "EPISODE";

                  title = episode.title;

                  image =
                    episode.parts?.[0]?.thumbnail ??
                    episode.thumbnail ??
                    null;

                  videoUrl =
                    episode.parts?.[0]?.videoUrl ??
                    episode.videoUrl ??
                    null;

                  typeLabel = "Episode";
                  badgeColor = "bg-purple-600";

                  subText =
                    episode.series?.title ?? "";

                  if (
                    episode.series?.id &&
                    episode.id
                  ) {
                    href =
                      `/series/${episode.series.id}/episode/${episode.id}`;
                  }
                }

                // =====================================================
                // ENTERTAINMENT
                // =====================================================

                else if (entertainment) {
                  contentType = "ENTERTAINMENT";

                  title = entertainment.title;

                  image =
                    entertainment.thumbnail ??
                    entertainment.image ??
                    null;

                  videoUrl =
                    entertainment.videoUrl ?? null;

                  typeLabel = "Entertainment";
                  badgeColor = "bg-emerald-600";

                  // IMPORTANT:
                  // /entertainments/[id] expects PLAYLIST ID
                  if (playlist?.id) {
                    href = `/entertainments/${playlist.id}`;
                  }

                  subText = playlist?.name ?? "";
                }
                else {
                  return null;
                }
              }



              // =====================================================
              // URLS
              // =====================================================

              const imageUrl = getUrl(image);
              const mediaVideoUrl = getUrl(videoUrl);

              // =====================================================
              // PROGRESS
              // =====================================================

              const progress = getProgress(item);

              const isDeleting =
                deletingId === item.id;

              const isClickable =
                Boolean(href);

              // =====================================================
              // KEY
              // =====================================================

              const historyKey =
                `${contentType}-${item.id}`;

              // =====================================================
              // THUMBNAIL
              // =====================================================

              const thumbnail = (
                <div
                  className="
        relative
        aspect-video
        w-full
        flex-shrink-0
        overflow-hidden
        rounded-xl
        bg-zinc-900
        sm:w-56
        md:w-64
      "
                >

                  {/* ================================================= */}
                  {/* IMAGE */}
                  {/* ================================================= */}

                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={title}
                      className="
            h-full
            w-full
            object-cover
            transition
            duration-200
            group-hover:scale-105
          "
                    />
                  ) : mediaVideoUrl ? (

                    /*
                     * No image:
                     * show the video as thumbnail.
                     *
                     * This is especially useful for News.
                     */

                    <video
                      src={mediaVideoUrl}
                      muted
                      playsInline
                      preload="metadata"
                      className="
            h-full
            w-full
            object-cover
          "
                    />

                  ) : (
                    <div
                      className="
            flex
            h-full
            w-full
            items-center
            justify-center
            text-xs
            text-zinc-600
          "
                    >
                      No Preview
                    </div>
                  )}

                  {/* ================================================= */}
                  {/* TYPE */}
                  {/* ================================================= */}

                  <span
                    className={`
          absolute
          left-2
          top-2
          rounded
          ${badgeColor}
          px-1.5
          py-0.5
          text-[10px]
          font-bold
          uppercase
          text-white
          shadow
        `}
                  >
                    {typeLabel}
                  </span>

                  {/* ================================================= */}
                  {/* DURATION */}
                  {/* ================================================= */}

                  {item.durationSeconds !== null &&
                    item.durationSeconds > 0 && (
                      <span
                        className="
              absolute
              bottom-2
              right-2
              rounded
              bg-black/80
              px-1.5
              py-0.5
              font-mono
              text-[10px]
              font-medium
              text-white
            "
                      >
                        {formatDuration(
                          item.durationSeconds
                        )}
                      </span>
                    )}

                  {/* ================================================= */}
                  {/* PROGRESS */}
                  {/* ================================================= */}

                  <div
                    className="
          absolute
          bottom-0
          left-0
          right-0
          h-1
          bg-zinc-800
        "
                  >
                    <div
                      className="h-full bg-red-600"
                      style={{
                        width: `${progress}%`,
                      }}
                    />
                  </div>

                  {/* ================================================= */}
                  {/* PLAY */}
                  {/* ================================================= */}

                  {isClickable && (
                    <div
                      className="
            absolute
            inset-0
            flex
            items-center
            justify-center
            bg-black/0
            transition
            group-hover:bg-black/20
          "
                    >
                      <div
                        className="
              flex
              h-10
              w-10
              scale-90
              items-center
              justify-center
              rounded-full
              bg-blue-600
              text-white
              opacity-0
              shadow-lg
              transition
              group-hover:scale-100
              group-hover:opacity-100
            "
                      >
                        ▶
                      </div>
                    </div>
                  )}
                </div>
              );

              // =====================================================
              // ITEM
              // =====================================================

              return (
                <div
                  key={historyKey}
                  className={`
        group
        relative
        flex
        flex-col
        gap-3
        border-b
        border-white/5
        pb-5
        sm:flex-row
        sm:items-start
        ${isDeleting
                      ? "pointer-events-none opacity-30"
                      : ""
                    }
      `}
                >

                  {/* ================================================= */}
                  {/* THUMBNAIL */}
                  {/* ================================================= */}

                  {href ? (
                    <Link
                      href={href}
                      className="block flex-shrink-0"
                    >
                      {thumbnail}
                    </Link>
                  ) : (
                    <div className="flex-shrink-0">
                      {thumbnail}
                    </div>
                  )}

                  {/* ================================================= */}
                  {/* DETAILS */}
                  {/* ================================================= */}

                  <div
                    className="
          flex
          flex-1
          flex-col
          justify-between
          pr-10
        "
                  >

                    {href ? (
                      <Link
                        href={href}
                        className="group/title"
                      >
                        <h2
                          className="
                line-clamp-2
                text-base
                font-medium
                text-zinc-100
                transition
                group-hover/title:text-blue-400
                sm:text-lg
              "
                        >
                          {title}
                        </h2>
                      </Link>
                    ) : (
                      <h2
                        className="
              line-clamp-2
              text-base
              font-medium
              text-zinc-100
              sm:text-lg
            "
                      >
                        {title}
                      </h2>
                    )}

                    {/* SUBTEXT */}

                    {subText && (
                      <p className="mt-1 text-xs text-zinc-400">
                        {subText}
                      </p>
                    )}

                    {/* PROGRESS */}

                    <div
                      className="
            mt-3
            flex
            flex-wrap
            items-center
            gap-2
            text-xs
            text-zinc-500
          "
                    >
                      <span>
                        Watched{" "}
                        {formatDuration(
                          item.progressSeconds
                        )}
                      </span>

                      <span>•</span>

                      <span>
                        {progress}% completed
                      </span>
                    </div>

                    {/* CONTINUE */}

                    {href &&
                      progress > 0 &&
                      progress < 100 && (
                        <Link
                          href={href}
                          className="
                mt-3
                w-fit
                rounded-full
                bg-white/10
                px-3
                py-1.5
                text-xs
                font-medium
                text-white
                transition
                hover:bg-blue-600
              "
                        >
                          Continue watching
                        </Link>
                      )}

                    {/* WATCH AGAIN */}

                    {href &&
                      progress >= 100 && (
                        <Link
                          href={href}
                          className="
                mt-3
                w-fit
                rounded-full
                bg-white/10
                px-3
                py-1.5
                text-xs
                font-medium
                text-white
                transition
                hover:bg-blue-600
              "
                        >
                          Watch again
                        </Link>
                      )}
                  </div>

                  {/* ================================================= */}
                  {/* DELETE */}
                  {/* ================================================= */}

                  <button
                    onClick={(e) =>
                      handleClearItem(
                        e,
                        item.id
                      )
                    }
                    disabled={
                      deletingId !== null
                    }
                    title="Remove from watch history"
                    className="
          absolute
          right-0
          top-0
          flex
          h-8
          w-8
          items-center
          justify-center
          rounded-full
          text-zinc-500
          opacity-100
          transition
          hover:bg-white/10
          hover:text-white
          sm:opacity-0
          sm:group-hover:opacity-100
        "
                  >
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}