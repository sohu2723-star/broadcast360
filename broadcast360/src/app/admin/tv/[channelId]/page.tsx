"use client";

import { useEffect, useRef } from "react";
import Hls from "hls.js";
import { useParams } from "next/navigation";

export default function TVPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const params = useParams();
  const channelId = params.channelId;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const streamUrl = `/streams/channel-${channelId}/index.m3u8`;

    // If browser supports HLS natively
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
      return;
    }

    // HLS.js fallback
    if (Hls.isSupported()) {
      const hls = new Hls();

      hls.loadSource(streamUrl);
      hls.attachMedia(video);

      return () => {
        hls.destroy();
      };
    }
  }, [channelId]);

  return (
    <div style={{ background: "black", height: "100vh" }}>
      <video
        ref={videoRef}
        controls
        autoPlay
        muted
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}