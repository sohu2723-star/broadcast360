
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";

import {
  getFavorites,
  removeFavorite,
  type Favorite,
} from "@/services/favorite.service";

type FavoriteContentType =
  | "NEWS"
  | "MOVIE"
  | "EPISODE"
  | "ENTERTAINMENT"
  | "UNKNOWN";

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] =
    useState<number | null>(null);

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
  // LOAD FAVORITES
  // =====================================================

  useEffect(() => {
    let mounted = true;

    async function loadFavorites() {
      try {
        const data = await getFavorites();

        if (!mounted) {
          return;
        }

        setFavorites(
          Array.isArray(data)
            ? data
            : []
        );
      } catch (error) {
        console.error(
          "Failed to load favorites:",
          error
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadFavorites();

    return () => {
      mounted = false;
    };
  }, []);

  // =====================================================
  // REMOVE FAVORITE
  // =====================================================

  const handleRemove = async (
    e: React.MouseEvent<HTMLButtonElement>,
    favorite: Favorite
  ) => {
    e.preventDefault();
    e.stopPropagation();

    if (removingId !== null) {
      return;
    }

    setRemovingId(favorite.id);

    try {
      if (favorite.movieId !== null) {
        await removeFavorite({
          movieId: favorite.movieId,
        });
      } else if (
        favorite.episodeId !== null
      ) {
        await removeFavorite({
          episodeId: favorite.episodeId,
        });
      } else if (
        favorite.entertainmentId !== null
      ) {
        await removeFavorite({
          entertainmentId:
            favorite.entertainmentId,
        });
      } else if (
        favorite.newsId !== null
      ) {
        await removeFavorite({
          newsId: favorite.newsId,
        });
      }

      setFavorites((prev) =>
        prev.filter(
          (item) =>
            item.id !== favorite.id
        )
      );
    } catch (error) {
      console.error(
        "Failed to remove favorite:",
        error
      );
    } finally {
      setRemovingId(null);
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
              My Favorites
            </h1>

            <p className="mt-1 text-sm text-zinc-400">
              Movies, episodes, entertainment and
              news you saved.
            </p>
          </div>

          <div className="flex items-center gap-3">

            <span className="rounded-full bg-white/10 px-4 py-2 text-xs font-medium text-zinc-300 sm:text-sm">
              {favorites.length}{" "}
              {favorites.length === 1
                ? "favorite"
                : "favorites"}
            </span>

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

        {favorites.length === 0 ? (

          <div className="flex min-h-[400px] flex-col items-center justify-center text-center">

            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-white/5 text-purple-200">
              <Heart size={36} strokeWidth={1.5} aria-hidden="true" />
            </div>

            <h2 className="text-xl font-semibold">
              No favorites yet
            </h2>

            <p className="mt-2 max-w-sm text-sm text-zinc-500">
              Movies, episodes, entertainment and
              news you favorite will appear here.
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
          /* FAVORITES */
          /* ================================================= */

          <div className="flex flex-col gap-5">

            {favorites.map((favorite) => {

              let title = "Favorite";
              let image: string | null = null;
              let href: string | null = null;

              let typeLabel = "Media";
              let badgeColor = "bg-blue-600";
              let subText = "";

              let contentType:
                FavoriteContentType =
                "UNKNOWN";

              // =================================================
              // NEWS
              // =================================================

              if (favorite.news) {
                const news = favorite.news;

                contentType = "NEWS";

                title = news.title;

                image =
                  news.image ?? null;

                href = news.id
                  ? `/news/watch/${news.id}`
                  : null;

                typeLabel = "News";
                badgeColor = "bg-red-600";

                subText =
                  news.channel?.name ??
                  news.type ??
                  "News";
              }

              // =================================================
              // MOVIE
              // =================================================

              else if (favorite.movie) {
                const movie =
                  favorite.movie;

                contentType = "MOVIE";

                title = movie.title;

                image =
                  movie.thumbnail ??
                  movie.poster ??
                  movie.image ??
                  null;

                /*
                 * IMPORTANT
                 *
                 * Movie watch page expects
                 * PLAYLIST ID.
                 *
                 * Do NOT use:
                 *
                 * /movies/watch/${movie.id}
                 *
                 * Use the playlist item.
                 */

                const playlistItem =
                  movie.playlistItems?.[0];

                const playlistId =
                  playlistItem?.playlistId ??
                  playlistItem?.playlist?.id ??
                  null;

                href = playlistId
                  ? `/movies/watch/${playlistId}`
                  : null;

                typeLabel = "Movie";
                badgeColor =
                  "bg-blue-600";

                subText =
                  playlistItem?.playlist
                    ?.name ??
                  movie.genre ??
                  "Movie";

                if (!playlistId) {
                  console.warn(
                    "Movie has no playlist:",
                    movie.id,
                    movie.title
                  );
                }
              }

              // =================================================
              // EPISODE
              // =================================================

              else if (favorite.episode) {
                const episode =
                  favorite.episode;

                contentType = "EPISODE";

                title = episode.title;

                image =
                  episode.thumbnailUrl ??
                  episode.thumbnail ??
                  null;

                /*
                 * Episode page expects:
                 *
                 * series ID
                 * +
                 * episode ID
                 */

                href =
                  episode.series?.id &&
                  episode.id
                    ? `/series/${episode.series.id}/episode/${episode.id}`
                    : null;

                typeLabel = "Episode";

                badgeColor =
                  "bg-purple-600";

                subText =
                  episode.series?.title ??
                  "Series";
              }

              // =================================================
              // ENTERTAINMENT
              // =================================================

              else if (
                favorite.entertainment
              ) {
                const entertainment =
                  favorite.entertainment;

                contentType =
                  "ENTERTAINMENT";

                title =
                  entertainment.title;

                image =
                  entertainment.thumbnail ??
                  entertainment.image ??
                  null;

                /*
                 * IMPORTANT
                 *
                 * Entertainment page expects
                 * PLAYLIST ID.
                 */

                const playlistItem =
                  entertainment
                    .playlistItems?.[0];

                const playlistId =
                  playlistItem?.playlistId ??
                  playlistItem?.playlist?.id ??
                  null;

                href = playlistId
                  ? `/entertainments/${playlistId}`
                  : null;

                typeLabel =
                  "Entertainment";

                badgeColor =
                  "bg-emerald-600";

                subText =
                  playlistItem?.playlist
                    ?.name ??
                  entertainment.category ??
                  "Entertainment";

                if (!playlistId) {
                  console.warn(
                    "Entertainment has no playlist:",
                    entertainment.id,
                    entertainment.title
                  );
                }
              }

              // =================================================
              // UNKNOWN
              // =================================================

              else {
                return null;
              }

              // =================================================
              // IMAGE URL
              // =================================================

              const imageUrl =
                getUrl(image);

              // =================================================
              // REMOVE STATE
              // =================================================

              const isRemoving =
                removingId ===
                favorite.id;

              // =================================================
              // KEY
              // =================================================

              const favoriteKey =
                `${contentType}-${favorite.id}`;

              // =================================================
              // THUMBNAIL
              // =================================================

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

                </div>
              );

              // =================================================
              // ITEM
              // =================================================

              return (
                <div
                  key={favoriteKey}
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
                    ${
                      isRemoving
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

                    {subText && (
                      <p className="mt-1 text-xs text-zinc-400">
                        {subText}
                      </p>
                    )}

                    <p className="mt-3 text-xs text-zinc-500">
                      Added to favorites
                    </p>

                    {href && (
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
                        Watch now
                      </Link>
                    )}

                    {!href && (
                      <p className="mt-3 text-xs text-yellow-500">
                        This content is not currently
                        available in a playlist.
                      </p>
                    )}

                  </div>

                  {/* ================================================= */}
                  {/* REMOVE */}
                  {/* ================================================= */}

                  <button
                    type="button"
                    onClick={(e) =>
                      handleRemove(
                        e,
                        favorite
                      )
                    }
                    disabled={
                      removingId !== null
                    }
                    title="Remove from favorites"
                    aria-label="Remove from favorites"
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
                      hover:text-red-400
                      sm:opacity-0
                      sm:group-hover:opacity-100
                    "
                  >
                    {isRemoving ? (
                      <span className="text-xs">
                        ...
                      </span>
                    ) : (
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
                    )}
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
