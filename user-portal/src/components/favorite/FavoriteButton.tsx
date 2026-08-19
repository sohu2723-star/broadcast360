"use client";

import { useEffect, useState } from "react";

import {
  addFavorite,
  removeFavorite,
  isFavorite,
  type FavoriteContent,
} from "@/services/favorite.service";

interface Props {
  content: FavoriteContent;
  className?: string;
}

export default function FavoriteButton({
  content,
  className = "",
}: Props) {
  const [favorite, setFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isPending, setIsPending] = useState(false);

  // =====================================================
  // CONTENT KEY
  // =====================================================

  const contentKey = getContentKey(content);

  // =====================================================
  // CHECK FAVORITE
  // =====================================================

  useEffect(() => {
    let mounted = true;

    async function checkFavorite() {
      try {
        setLoading(true);

        const result = await isFavorite(content);

        if (mounted) {
          setFavorite(result);
        }
      } catch (error) {
        console.error(
          "CHECK FAVORITE ERROR:",
          error
        );

        if (mounted) {
          setFavorite(false);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    checkFavorite();

    return () => {
      mounted = false;
    };
  }, [contentKey]);

  // =====================================================
  // TOGGLE FAVORITE
  // =====================================================

  async function handleToggle() {
    if (loading || isPending) {
      return;
    }

    const previousState = favorite;

    // Optimistic UI
    setFavorite(!previousState);
    setIsPending(true);

    try {
      if (previousState) {
        await removeFavorite(content);
      } else {
        await addFavorite(content);
      }
    } catch (error) {
      console.error(
        "FAVORITE TOGGLE ERROR:",
        error
      );

      // Rollback
      setFavorite(previousState);
    } finally {
      setIsPending(false);
    }
  }

  // =====================================================
  // BUTTON
  // =====================================================

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={loading || isPending}
      aria-label={
        favorite
          ? "Remove from favorites"
          : "Add to favorites"
      }
      aria-pressed={favorite}
      className={`
        group
        relative
        inline-flex
        items-center
        justify-center
        rounded-full
        border
        border-white/10
        bg-black/40
        p-2.5
        transition-all
        duration-200
        hover:scale-105
        hover:bg-white/10
        active:scale-95
        disabled:cursor-not-allowed
        disabled:opacity-50
        ${className}
      `}
    >
      {loading || isPending ? (
        // =================================================
        // LOADING
        // =================================================

        <svg
          className="h-5 w-5 animate-spin text-white/70"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />

          <path
            className="opacity-75"
            fill="currentColor"
            d="
              M4 12
              a8 8 0 018-8
              V0
              C5.373 0 0 5.373 0 12
              h4
              zm2 5.291
              A7.962 7.962 0 014 12
              H0
              c0 3.042 1.135 5.824 3 7.938
              l3-2.647z
            "
          />
        </svg>
      ) : (
        // =================================================
        // HEART
        // =================================================

        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          className={`
            h-5 w-5
            transition-transform
            duration-200
            ${
              favorite
                ? "scale-110 fill-red-500 stroke-red-500"
                : "fill-none stroke-white group-hover:stroke-red-400"
            }
          `}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0016.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 002 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
        </svg>
      )}
    </button>
  );
}

// =====================================================
// CONTENT KEY
// =====================================================

function getContentKey(
  content: FavoriteContent
): string {
  if ("movieId" in content) {
    return `movie-${content.movieId}`;
  }

  if ("episodeId" in content) {
    return `episode-${content.episodeId}`;
  }

  if ("entertainmentId" in content) {
    return `entertainment-${content.entertainmentId}`;
  }

  if ("newsId" in content) {
    return `news-${content.newsId}`;
  }

  return "unknown";
}