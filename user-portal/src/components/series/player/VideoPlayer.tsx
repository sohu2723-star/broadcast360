"use client";

import { useEffect, useRef } from "react";

import type { EpisodePart } from "@/types/series-details";

interface Props {
  episode: EpisodePart;

  onVideoEnded: () => void;
}

export default function VideoPlayer({ episode, onVideoEnded }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!videoRef.current) return;

    videoRef.current.load();

    videoRef.current.play().catch(() => {});
  }, [episode.id]);

  return (
    <div className="overflow-hidden rounded-xl bg-black">
      <video
        ref={videoRef}
        key={episode.id}
        controls
        autoPlay
        controlsList="nodownload"
        disablePictureInPicture
        poster={episode.thumbnail ?? undefined}
        onEnded={onVideoEnded}
        className="aspect-video w-full"
      >
        <source
          src={`http://localhost:3000${episode.videoUrl}`}
          type="video/mp4"
        />
        Your browser does not support HTML5 video.
      </video>

      <div className="flex items-center justify-between  px-5 py-3">
        <div>
          <h2 className="text-lg font-semibold text-white">{episode.title}</h2>

          <p className="text-sm text-zinc-400">
            {Math.floor(episode.duration / 60)} min
          </p>
        </div>
      </div>
    </div>
  );
}
