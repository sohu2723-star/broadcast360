"use client";

import { useEffect, useMemo, useState } from "react";

import type { Episode } from "@/types/series-details";

import VideoPlayer from "./VideoPlayer";
import EpisodeList from "./EpisodeList";
import NextEpisodeOverlay from "./NextEpisodeOverlay";

interface Props {
  episodes: Episode[];
}

export default function SeriesPlayer({ episodes }: Props) {
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);

  const [showOverlay, setShowOverlay] = useState(false);

  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (episodes.length > 0) {
      setCurrentEpisode(episodes[0]);
    }
  }, [episodes]);

  const currentIndex = useMemo(() => {
    if (!currentEpisode) return -1;

    return episodes.findIndex((episode) => episode.id === currentEpisode.id);
  }, [episodes, currentEpisode]);

  const nextEpisode =
    currentIndex >= 0 ? episodes[currentIndex + 1] : undefined;

  useEffect(() => {
    if (!showOverlay || !nextEpisode) return;

    if (countdown === 0) {
      playNextEpisode();
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((value) => value - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [showOverlay, countdown, nextEpisode]);

  function playNextEpisode() {
    if (!nextEpisode) return;

    setCurrentEpisode(nextEpisode);
    setShowOverlay(false);
    setCountdown(5);
  }

  function cancelAutoPlay() {
    setShowOverlay(false);
    setCountdown(5);
  }

  if (!currentEpisode) {
    return null;
  }

  return (
    <section className="space-y-6">
      <div className="relative">
        <VideoPlayer
          episode={currentEpisode}
          onVideoEnded={() => {
            if (nextEpisode) {
              setShowOverlay(true);
            }
          }}
        />

        {showOverlay && nextEpisode && (
          <NextEpisodeOverlay
            episode={nextEpisode}
            seconds={countdown}
            onPlayNow={playNextEpisode}
            onCancel={cancelAutoPlay}
          />
        )}
      </div>

      <EpisodeList
        episodes={episodes}
        currentEpisode={currentEpisode}
        onSelect={(episode) => {
          cancelAutoPlay();
          setCurrentEpisode(episode);
        }}
      />
    </section>
  );
}
