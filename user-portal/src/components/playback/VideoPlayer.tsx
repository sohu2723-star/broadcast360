"use client";

import { useEffect, useRef } from "react";

import type { Movie } from "@/types/movie";
import authApi from "@/lib/authapi";

export default function VideoPlayer({
  movie,
}: {
  movie: Movie;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const saveIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Prevent setting resume position more than once
  const resumeAppliedRef = useRef(false);

  useEffect(() => {
    const video = videoRef.current;

    if (!video || !movie.videoUrl) {
      return;
    }

    video.pause();

    video.src = movie.videoUrl;

    video.load();

    resumeAppliedRef.current = false;

    // =====================================
    // LOAD PREVIOUS WATCH PROGRESS
    // =====================================

    const loadProgress = async () => {
      try {
        const response = await authApi.get(
          "/api/user-portal/auth/history"
        );

        const history = response.data.history ?? [];

        const movieHistory = history.find(
          (item: any) =>
            item.playlistItem?.movie?.id === movie.id
        );

        if (!movieHistory) {
          console.log(
            "No previous history for movie:",
            movie.id
          );

          return;
        }

        const progress =
          movieHistory.progressSeconds;

        const duration =
          movieHistory.durationSeconds;

        // Don't resume if basically finished
        if (
          !duration ||
          progress <= 0 ||
          progress >= duration - 5
        ) {
          return;
        }

        const applyProgress = () => {
          if (
            resumeAppliedRef.current ||
            !video.duration ||
            !Number.isFinite(video.duration)
          ) {
            return;
          }

          video.currentTime = progress;

          resumeAppliedRef.current = true;

          console.log(
            `Resuming movie ${movie.id} from ${progress}s`
          );
        };

        // Metadata may already be loaded
        if (video.readyState >= 1) {
          applyProgress();
        } else {
          video.addEventListener(
            "loadedmetadata",
            applyProgress,
            { once: true }
          );
        }
      } catch (error: any) {
        // Guest users are allowed to watch.
        // They simply won't have history.

        console.log(
          "No watch history available:",
          error?.response?.status
        );
      }
    };

    loadProgress();

    // =====================================
    // SAVE WATCH HISTORY
    // =====================================

    const saveHistory = async () => {
      if (
        !video.duration ||
        !Number.isFinite(video.duration)
      ) {
        return;
      }

      try {
        await authApi.post(
          "/api/user-portal/auth/history",
          {
            movieId: movie.id,

            progressSeconds: Math.floor(
              video.currentTime
            ),

            durationSeconds: Math.floor(
              video.duration
            ),
          }
        );

        console.log(
          "Watch history saved:",
          movie.id,
          Math.floor(video.currentTime)
        );
      } catch (error: any) {
        console.log(
          "Watch history not saved:",
          error?.response?.status
        );
      }
    };

    // =====================================
    // START PERIODIC SAVE AFTER METADATA
    // =====================================

    const handleMetadata = () => {
      console.log(
        "Video metadata loaded:",
        video.duration
      );

      if (saveIntervalRef.current) {
        clearInterval(
          saveIntervalRef.current
        );
      }

      saveIntervalRef.current =
        setInterval(saveHistory, 10000);
    };

    video.addEventListener(
      "loadedmetadata",
      handleMetadata
    );

    // =====================================
    // SAVE WHEN VIDEO ENDS
    // =====================================

    video.addEventListener(
      "ended",
      saveHistory
    );

    return () => {
      video.removeEventListener(
        "loadedmetadata",
        handleMetadata
      );

      video.removeEventListener(
        "ended",
        saveHistory
      );

      if (saveIntervalRef.current) {
        clearInterval(
          saveIntervalRef.current
        );

        saveIntervalRef.current = null;
      }
    };
  }, [movie.id, movie.videoUrl]);

  // =====================================
  // NO VIDEO
  // =====================================

  if (!movie.videoUrl) {
    return (
      <div className="flex aspect-video items-center justify-center rounded-xl bg-black text-gray-500">
        No video available
      </div>
    );
  }

  // =====================================
  // PLAYER
  // =====================================

  return (
    <video
      key={movie.videoUrl}
      ref={videoRef}
      controls
      playsInline
      preload="metadata"
      controlsList="nodownload"
      disablePictureInPicture
      className="aspect-video w-full rounded-xl bg-black object-contain"
    />
  );
}