"use client";

import { useEffect, useState } from "react";

import VideoPlayer from "./VideoPlayer";
import NextEpisodeOverlay from "./NextEpisodeOverlay";

import type { Episode } from "@/types/series-details";

interface Props {
  episodes: Episode[];

  currentEpisode: Episode;

  currentPartIndex: number;

  onEpisodeChange: (episode: Episode) => void;

  onPartChange: (index: number) => void;
}

export default function SeriesPlayer({
  episodes = [],
  currentEpisode,
  currentPartIndex,
  onEpisodeChange,
  onPartChange,
}: Props) {
  const [showOverlay, setShowOverlay] = useState(false);

  const [countdown, setCountdown] = useState(5);

  if (!episodes || episodes.length === 0 || !currentEpisode) {
    return null;
  }

  const currentEpisodeIndex = episodes.findIndex(
    (e) => e.episodeNo === currentEpisode.episodeNo,
  );

  const currentPart = currentEpisode.parts[currentPartIndex];

  const hasNextPart = currentPartIndex < currentEpisode.parts.length - 1;

  const nextEpisode =
    currentEpisodeIndex < episodes.length - 1
      ? episodes[currentEpisodeIndex + 1]
      : null;

  function playNext() {
    // Next Part
    if (hasNextPart) {
      onPartChange(currentPartIndex + 1);

      setShowOverlay(false);

      setCountdown(5);

      return;
    }

    // Next Episode
    if (nextEpisode) {
      onEpisodeChange(nextEpisode);

      onPartChange(0);

      setShowOverlay(false);

      setCountdown(5);
    }
  }

  function cancelAutoPlay() {
    setShowOverlay(false);

    setCountdown(5);
  }

  useEffect(() => {
    if (!showOverlay) return;

    if (countdown === 0) {
      playNext();

      return;
    }

    const timer = setTimeout(() => {
      setCountdown((value) => value - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [showOverlay, countdown]);

  const overlayEpisode: Episode = hasNextPart
    ? {
        ...currentEpisode,
        title: `Part ${currentPartIndex + 2}`,
      }
    : nextEpisode
      ? {
          ...nextEpisode,
          title: `Episode ${nextEpisode.episodeNo}`,
        }
      : currentEpisode;

  return (
    <section className="col-span-8 space-y-6">
      <div className="relative">
        <VideoPlayer
          episode={currentPart}
          onVideoEnded={() => {
            if (hasNextPart || nextEpisode) {
              setShowOverlay(true);
            }
          }}
        />

        {showOverlay && (
          <NextEpisodeOverlay
            episode={overlayEpisode}
            seconds={countdown}
            onPlayNow={playNext}
            onCancel={cancelAutoPlay}
          />
        )}
      </div>
    </section>
  );
}
