"use client";

import { useEffect, useRef } from "react";
import Hls from "hls.js";
import { Channel } from "@/types";

interface Props {
  channel: Channel | null;
}

export default function VideoPlayer({ channel }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!channel?.playbackUrl) return;

    const video = videoRef.current;

    if (!video) return;

    const streamUrl = channel.playbackUrl;

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });

      hls.loadSource(streamUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {});
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        console.error("HLS Error:", data);
      });

      return () => {
        hls.destroy();
      };
    }

    // Safari native HLS support
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;

      video.play().catch(() => {});
    }
  }, [channel]);

  return (
    <div className="flex-1 bg-black rounded-xl overflow-hidden">
      {channel ? (
        <video
          ref={videoRef}
          controls
          autoPlay
          muted
          playsInline
          className="w-full h-full object-contain"
        />
      ) : (
        <div className="flex items-center justify-center h-full text-gray-400">
          Select a channel
        </div>
      )}
    </div>
  );
}