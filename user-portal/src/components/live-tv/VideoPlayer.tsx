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

    if (!channel?.streamUrl) return;

    const video = videoRef.current;

    if (!video) return;


    if (Hls.isSupported()) {

      const hls = new Hls();

      hls.loadSource(channel.streamUrl);

      hls.attachMedia(video);


      hls.on(
        Hls.Events.ERROR,
        (_, data) => {
          console.log("HLS ERROR", data);
        }
      );


      return () => {
        hls.destroy();
      };

    }

    else if(video.canPlayType("application/vnd.apple.mpegurl")) {

      video.src = channel.streamUrl;

    }


  }, [channel]);



  return (
    <div className="flex-1 bg-black rounded-xl overflow-hidden">

      {
        channel ? (

          <video
            ref={videoRef}
            controls
            autoPlay
            muted
            playsInline
            className="w-full h-full object-contain"
          />

        ) : (

          <div className="flex h-full items-center justify-center text-gray-400">
            Select channel
          </div>

        )
      }

    </div>
  );
}