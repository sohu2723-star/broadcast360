"use client";

import { useEffect, useRef } from "react";

import type { Movie } from "@/types/movie";

export default function VideoPlayer({ movie }: { movie: Movie }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;

    if (!video || !movie.videoUrl) {
      return;
    }

    video.pause();

    video.src = movie.videoUrl;

    video.load();
  }, [movie.videoUrl]);

  if (!movie.videoUrl) {
    return (
      <div className="flex aspect-video items-center justify-center rounded-xl bg-black text-gray-500">
        No video available
      </div>
    );
  }

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
