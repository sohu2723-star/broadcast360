"use client";

import { useEffect, useRef } from "react";

import type { EpisodePart } from "@/types/series-details";
import authApi from "@/lib/authapi";
import FavoriteButton from "@/components/favorite/FavoriteButton";

interface Props {
  episode: EpisodePart;
  onVideoEnded: () => void;
}

export default function VideoPlayer({
  episode,
  onVideoEnded,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const saveIntervalRef =
    useRef<NodeJS.Timeout | null>(null);

  const resumeAppliedRef = useRef(false);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) return;

    resumeAppliedRef.current = false;

    video.load();

    video.play().catch(() => { });

    // =====================================
    // LOAD PREVIOUS WATCH PROGRESS
    // =====================================

    const loadProgress = async () => {
      try {
        const response = await authApi.get(
          "/api/user-portal/auth/history"
        );

        const history = response.data.history ?? [];

        const episodeHistory = history.find(
          (item: any) =>
            item.playlistItem?.episode?.id === episode.id
        );

        if (!episodeHistory) {
          console.log(
            "No previous history for episode:",
            episode.id
          );

          return;
        }

        const progress =
          episodeHistory.progressSeconds;

        const duration =
          episodeHistory.durationSeconds;

        // Don't resume completed videos
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
            `Resuming episode ${episode.id} from ${progress}s`
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
          "No episode history available:",
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
            episodeId: episode.id,

            progressSeconds: Math.floor(
              video.currentTime
            ),

            durationSeconds: Math.floor(
              video.duration
            ),
          }
        );

        console.log(
          "Episode history saved:",
          episode.id,
          Math.floor(video.currentTime)
        );
      } catch (error: any) {
        console.log(
          "Episode history not saved:",
          error?.response?.status
        );
      }
    };

    // =====================================
    // START SAVE TIMER
    // =====================================

    const handleMetadata = () => {
      console.log(
        "Episode metadata loaded:",
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
    // SAVE WHEN ENDED
    // =====================================

    const handleEnded = async () => {
      await saveHistory();

      onVideoEnded();
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
  }, [episode.id]);

  return (
    <div className="overflow-hidden rounded-xl bg-black">
      <video
        ref={videoRef}
        key={episode.id}
        controls
        autoPlay
        playsInline
        preload="metadata"
        controlsList="nodownload"
        disablePictureInPicture
        poster={episode.thumbnail ?? undefined}
        className="aspect-video w-full"
      >
        <source
          src={`http://localhost:3000${episode.videoUrl}`}
          type="video/mp4"
        />

        Your browser does not support HTML5 video.
      </video>
      <div className="flex items-start justify-between gap-4 px-5 py-3">
        {/* Left: Title & Duration */}
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold text-white leading-tight">
            {episode.title}
          </h1>

          {episode.duration ? (
            <p className="mt-1 text-sm text-zinc-400">
              {Math.floor(episode.duration / 60)} min
            </p>
          ) : null}
        </div>

        {/* Right: Favorite Button */}
        <div className="shrink-0 pt-0.5">
          <FavoriteButton
            content={{
              episodeId: episode.id,
            }}
          />
        </div>
      </div>
    </div>
  );
}