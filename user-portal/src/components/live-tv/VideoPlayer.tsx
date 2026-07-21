"use client";

import { useEffect, useRef } from "react";
import Hls from "hls.js";
import { Channel } from "@/types";

interface Props {
  channel: Channel | null;
}

<<<<<<< HEAD
export default function VideoPlayer({
  channel,
}: Props) {

=======
export default function VideoPlayer({ channel }: Props) {
>>>>>>> 65be927f78b00ce5f8ca8b3ccec3766efc5c3f2a
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
<<<<<<< HEAD

    if (!channel?.playbackUrl) return;
=======
    if (!channel?.streamUrl) return;
>>>>>>> 65be927f78b00ce5f8ca8b3ccec3766efc5c3f2a

    const video = videoRef.current;

    if (!video) return;

<<<<<<< HEAD

    const streamUrl = channel.playbackUrl;


    if (Hls.isSupported()) {

      const hls = new Hls({
=======
    if (Hls.isSupported()) {
      const hls = new Hls();
>>>>>>> 65be927f78b00ce5f8ca8b3ccec3766efc5c3f2a

        enableWorker: true,

        lowLatencyMode: true,

      });


      hls.loadSource(streamUrl);

      hls.attachMedia(video);

<<<<<<< HEAD

      hls.on(
        Hls.Events.MANIFEST_PARSED,
        () => {

          video.play()
            .catch(() => {});

        }
      );


      hls.on(
        Hls.Events.ERROR,
        (_, data) => {

          console.error(
            "HLS Error:",
            data
          );

        }
      );

=======
      hls.on(Hls.Events.ERROR, (_, data) => {
        console.log("HLS ERROR", data);
      });
>>>>>>> 65be927f78b00ce5f8ca8b3ccec3766efc5c3f2a

      return () => {

        hls.destroy();

      };
<<<<<<< HEAD

    }


    // Safari native HLS

    if (
      video.canPlayType(
        "application/vnd.apple.mpegurl"
      )
    ) {

      video.src = streamUrl;

      video.play()
        .catch(() => {});

=======
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = channel.streamUrl;
>>>>>>> 65be927f78b00ce5f8ca8b3ccec3766efc5c3f2a
    }
  }, [channel]);

<<<<<<< HEAD

  return (
    <div className="flex-1 bg-black rounded-xl overflow-hidden">

      {channel ? (

=======
  return (
    <div className="flex-1 bg-black rounded-xl overflow-hidden">
      {channel ? (
>>>>>>> 65be927f78b00ce5f8ca8b3ccec3766efc5c3f2a
        <video
          ref={videoRef}
          controls
          autoPlay
          muted
          playsInline
          className="w-full h-full object-contain"
        />
<<<<<<< HEAD

      ) : (

        <div className="flex items-center justify-center h-full text-gray-400">
          Select a channel
        </div>

      )}

=======
      ) : (
        <div className="flex h-full items-center justify-center text-gray-400">
          Select channel
        </div>
      )}
>>>>>>> 65be927f78b00ce5f8ca8b3ccec3766efc5c3f2a
    </div>
  );
}
