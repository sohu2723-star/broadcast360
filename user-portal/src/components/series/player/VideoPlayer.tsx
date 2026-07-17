"use client";

import { useRef } from "react";

import type { Episode } from "@/types/series-details";

interface Props {
  episode: Episode;
  onVideoEnded: () => void;
}

export default function VideoPlayer({ episode, onVideoEnded }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <div className="overflow-hidden rounded-xl bg-black">
      <video
        ref={videoRef}
        key={episode.id}
        controls
        autoPlay
        className="aspect-video w-full"
        poster={episode.thumbnail || undefined}
        onEnded={onVideoEnded}
      >
        <source
          src={`http://localhost:3000${episode.videoUrl}`}
          type="video/mp4"
        />
        Your browser does not support HTML5 video.
      </video>
    </div>
  );
}
