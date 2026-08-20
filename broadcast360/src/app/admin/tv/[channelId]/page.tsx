
"use client";

import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { useParams } from "next/navigation";

export default function TVPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const checkTimerRef = useRef<NodeJS.Timeout | null>(null);

  const params = useParams();
  const channelId = params.channelId as string;

  const [streamKey, setStreamKey] = useState<string | null>(null);

  /*
   * Get channel information first.
   */
  useEffect(() => {
    if (!channelId) return;

    const fetchChannel = async () => {
      try {
        console.log("🔎 Fetching channel:", channelId);

        const res = await fetch(
          `/api/channels/${channelId}`
        );

        if (!res.ok) {
          throw new Error(
            `Channel API returned ${res.status}`
          );
        }

        const channel = await res.json();

        console.log(" Channel:", channel);

        if (!channel.streamKey) {
          console.error(
            " Channel does not have a streamKey"
          );

          return;
        }

        console.log(
          "🔑 Stream Key:",
          channel.streamKey
        );

        setStreamKey(channel.streamKey);
      } catch (error) {
        console.error(
          " Failed to fetch channel:",
          error
        );
      }
    };

    fetchChannel();
  }, [channelId]);

  /*
   * Start HLS after streamKey is available.
   */
  useEffect(() => {
    const video = videoRef.current;

    if (!video || !channelId || !streamKey) {
      return;
    }

    const streamUrl =
      `http://localhost:8888/channel/${streamKey}/index.m3u8`;

    console.log(" HLS URL:", streamUrl);

    const startPlayer = () => {
      console.log(" Starting HLS player");

      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }

      const hls = new Hls({
        liveSyncDurationCount: 3,
        enableWorker: true,
      });

      hlsRef.current = hls;

      hls.loadSource(streamUrl);
      hls.attachMedia(video);

      hls.on(
        Hls.Events.MANIFEST_PARSED,
        () => {
          console.log(" HLS ready");

          video.play().catch(() => {});
        }
      );

      hls.on(
        Hls.Events.ERROR,
        (_, data) => {
          console.log("HLS error:", data);

          if (!data.fatal) return;

          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.log(
                "🔄 Recover network"
              );

              hls.startLoad();
              break;

            case Hls.ErrorTypes.MEDIA_ERROR:
              console.log(
                "🔄 Recover media"
              );

              hls.recoverMediaError();
              break;

            default:
              console.log(
                " Fatal HLS error"
              );

              hls.destroy();
              hlsRef.current = null;

              setTimeout(() => {
                startPlayer();
              }, 3000);
          }
        }
      );
    };

    const waitForStream = () => {
      console.log(
        "⏳ Waiting for HLS stream..."
      );

      checkTimerRef.current =
        setInterval(async () => {
          try {
            const res = await fetch(
              `${streamUrl}?t=${Date.now()}`
            );

            if (res.ok) {
              console.log(
                " Stream found"
              );

              if (checkTimerRef.current) {
                clearInterval(
                  checkTimerRef.current
                );

                checkTimerRef.current = null;
              }

              startPlayer();
            } else {
              console.log(
                "⏳ Stream not ready:",
                res.status
              );
            }
          } catch {
            console.log(
              "⏳ Waiting stream..."
            );
          }
        }, 3000);
    };

    /*
     * Safari
     */
    if (
      video.canPlayType(
        "application/vnd.apple.mpegurl"
      )
    ) {
      console.log(
        "🍎 Using native HLS"
      );

      video.src = streamUrl;

      video.play().catch(() => {});
    }

    /*
     * Chrome / Edge / Firefox
     */
    else if (Hls.isSupported()) {
      console.log(
        "🌐 Using hls.js"
      );

      waitForStream();
    }

    else {
      console.error(
        " HLS is not supported"
      );
    }

    return () => {
      if (checkTimerRef.current) {
        clearInterval(
          checkTimerRef.current
        );

        checkTimerRef.current = null;
      }

      hlsRef.current?.destroy();
      hlsRef.current = null;

      video.removeAttribute("src");
      video.load();
    };
  }, [channelId, streamKey]);

  return (
    <div
      style={{
        background: "black",
        height: "100vh",
      }}
    >
      <video
        ref={videoRef}
        controls
        autoPlay
        playsInline
        style={{
          width: "100%",
          height: "100%",
        }}
      />
    </div>
  );
}
