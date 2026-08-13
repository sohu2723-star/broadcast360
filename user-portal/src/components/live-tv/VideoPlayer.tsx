"use client";

import { useEffect, useRef } from "react";
import Hls from "hls.js";
import { Channel } from "@/types";

interface Props {
  channel: Channel | null;
}

export default function VideoPlayer({ channel }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamUrl = channel?.playbackUrl;

  useEffect(() => {
    if (!streamUrl) return;

    const video = videoRef.current;
    if (!video) return;

    let hls: Hls | null = null;

    if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90, // Keeps back-buffer clean
      });

      hls.loadSource(streamUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {});
      });

      // Automatic error recovery to stay connected to live streams
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.warn("HLS Network Error - Attempting recovery...");
              hls?.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.warn("HLS Media Error - Attempting recovery...");
              hls?.recoverMediaError();
              break;
            default:
              console.error("Unrecoverable HLS error, re-initializing...");
              hls?.destroy();
              break;
          }
        }
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // Safari native HLS support
      video.src = streamUrl;
      video.play().catch(() => {});
    }

    // Cleanup when streamUrl changes or component unmounts
    return () => {
      if (hls) {
        hls.destroy();
      }
      if (video) {
        video.removeAttribute("src");
        video.load();
      }
    };
  }, [streamUrl]);

  return (
    <div className="flex-1 bg-black rounded-xl overflow-hidden">
      {channel ? (
        <video
          ref={videoRef}
          controls
          autoPlay
          playsInline
          controlsList="nodownload noplaybackrate"
          className="w-full h-full object-contain [&::-webkit-media-controls-timeline]:hidden [&::-webkit-media-controls-current-time-display]:hidden [&::-webkit-media-controls-time-remaining-display]:hidden"
        />
      ) : (
        <div className="flex items-center justify-center h-full text-gray-400">
          Select a channel
        </div>
      )}
    </div>
  );
}