"use client";

import { useEffect, useRef } from "react";

import type { Entertainment } from "@/types/entertainment";
import authApi from "@/lib/authapi";

export default function VideoPlayer({
  entertainment,
}: {
  entertainment: Entertainment;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const saveIntervalRef =
    useRef<NodeJS.Timeout | null>(null);

  const resumeAppliedRef = useRef(false);

  useEffect(() => {
    const video = videoRef.current;

    if (!video || !entertainment.videoUrl) {
      return;
    }

    // Reset resume state when changing entertainment
    resumeAppliedRef.current = false;

    // =====================================
    // LOAD VIDEO
    // =====================================

    video.pause();

    video.src = entertainment.videoUrl;

    video.load();

    // =====================================
    // LOAD PREVIOUS WATCH HISTORY
    // =====================================

    const loadProgress = async () => {
      try {
        const response = await authApi.get(
          "/api/user-portal/auth/history"
        );

        const history =
          response.data.history ?? [];

        const previousHistory = history.find(
          (item: any) =>
            item.playlistItem?.entertainment?.id ===
            entertainment.id
        );

        if (!previousHistory) {
          console.log(
            "No previous history for entertainment:",
            entertainment.id
          );

          return;
        }

        const progress =
          previousHistory.progressSeconds;

        const duration =
          previousHistory.durationSeconds;

        // =====================================
        // DON'T RESUME COMPLETED CONTENT
        // =====================================

        if (
          !duration ||
          progress <= 0 ||
          progress >= duration - 5
        ) {
          return;
        }

        // =====================================
        // APPLY RESUME POSITION
        // =====================================

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
            `Resuming entertainment ${entertainment.id} from ${progress}s`
          );
        };

        if (video.readyState >= 1) {
          applyProgress();
        } else {
          video.addEventListener(
            "loadedmetadata",
            applyProgress,
            {
              once: true,
            }
          );
        }
      } catch (error: any) {
        // Guest users don't have history.
        console.log(
          "Watch history unavailable:",
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
            entertainmentId:
              entertainment.id,

            progressSeconds: Math.floor(
              video.currentTime
            ),

            durationSeconds: Math.floor(
              video.duration
            ),
          }
        );

        console.log(
          "Entertainment history saved:",
          entertainment.id,
          Math.floor(video.currentTime)
        );
      } catch (error: any) {
        console.log(
          "Entertainment history not saved:",
          error?.response?.status
        );
      }
    };

    // =====================================
    // START SAVE TIMER
    // =====================================

    const handleMetadata = () => {
      console.log(
        "Entertainment duration:",
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
    // SAVE WHEN USER LEAVES PAGE
    // =====================================

    const handleEnded = () => {
      saveHistory();
    };

    video.addEventListener(
      "ended",
      handleEnded
    );

    // =====================================
    // CLEANUP
    // =====================================

    return () => {
      video.removeEventListener(
        "loadedmetadata",
        handleMetadata
      );

      video.removeEventListener(
        "ended",
        handleEnded
      );

      if (saveIntervalRef.current) {
        clearInterval(
          saveIntervalRef.current
        );

        saveIntervalRef.current = null;
      }
    };
  }, [
    entertainment.id,
    entertainment.videoUrl,
  ]);

  // =====================================
  // NO VIDEO
  // =====================================

  if (!entertainment.videoUrl) {
    return (
      <div className="flex aspect-video items-center justify-center rounded-xl bg-black text-gray-500">
        No video available
      </div>
    );
  }

  // =====================================
  // VIDEO PLAYER
  // =====================================

  return (
    <video
      key={entertainment.id}
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