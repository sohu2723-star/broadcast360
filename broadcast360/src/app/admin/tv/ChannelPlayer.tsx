"use client";

import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";

interface Channel {
  id: number;
  name: string;
  streamKey: string;
}

interface Props {
  channel: Channel;
  isMain?: boolean;
}

type ChannelStatus =
  | "loading"
  | "live"
  | "vod"
  | "offline";

export default function ChannelPlayer({
  channel,
  isMain = false,
}: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const hlsRef = useRef<Hls | null>(null);

  const retryTimerRef =
    useRef<ReturnType<typeof setTimeout> | null>(null);

  const statusTimerRef =
    useRef<ReturnType<typeof setInterval> | null>(null);

  const [status, setStatus] =
    useState<ChannelStatus>("loading");

  const streamUrl =
    `http://localhost:8888/channel/${channel.streamKey}/index.m3u8`;

  useEffect(() => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    let destroyed = false;

    /*
     * ==========================================================
     * CHECK REAL CHANNEL STATUS
     * ==========================================================
     *
     * Backend decides:
     *
     * LIVE     = actual live source connected
     * VOD      = channel output running but no live source
     * OFFLINE  = nothing running
     */

    const checkChannelStatus = async () => {
      if (destroyed) {
        return;
      }

      try {
        const response = await fetch(
          `/api/channels/${channel.id}/status?t=${Date.now()}`,
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          console.log(
            `⚠️ Status API failed: ${channel.name}`
          );

          setStatus("offline");
          return;
        }

        const data = await response.json();

        console.log(
          `📡 ${channel.name} status:`,
          {
            status: data.status,
            isLive: data.isLive,
            sourceOnline: data.sourceOnline,
            channelOnline: data.channelOnline,
          }
        );

        /*
         * ======================================================
         * USE BACKEND STATUS
         * ======================================================
         */

        if (data.status === "live") {
          setStatus("live");
        } else if (data.status === "vod") {
          setStatus("vod");
        } else {
          setStatus("offline");
        }
      } catch (error) {
        console.error(
          `❌ Status check failed: ${channel.name}`,
          error
        );

        setStatus("offline");
      }
    };

    /*
     * ==========================================================
     * CLEANUP
     * ==========================================================
     */

    const cleanup = () => {
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
        retryTimerRef.current = null;
      }

      if (statusTimerRef.current) {
        clearInterval(statusTimerRef.current);
        statusTimerRef.current = null;
      }

      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }

      video.pause();
      video.removeAttribute("src");
      video.load();
    };

    /*
     * ==========================================================
     * RETRY
     * ==========================================================
     */

    const retry = () => {
      if (destroyed) {
        return;
      }

      if (retryTimerRef.current) {
        return;
      }

      retryTimerRef.current = setTimeout(() => {
        retryTimerRef.current = null;

        if (!destroyed) {
          startPlayer();
        }
      }, 3000);
    };

    /*
     * ==========================================================
     * VIDEO PLAYING
     * ==========================================================
     *
     * IMPORTANT:
     *
     * Do NOT set LIVE here.
     *
     * Backend MediaMTX status decides LIVE.
     */

    const handlePlaying = () => {
      if (destroyed) {
        return;
      }

      console.log(
        `▶️ Video playing: ${channel.name}`
      );
    };

    /*
     * ==========================================================
     * VIDEO WAITING
     * ==========================================================
     */

    const handleWaiting = () => {
      if (destroyed) {
        return;
      }

      console.log(
        `⏳ Buffering: ${channel.name}`
      );
    };

    /*
     * ==========================================================
     * VIDEO ERROR
     * ==========================================================
     */

    const handleVideoError = () => {
      if (destroyed) {
        return;
      }

      console.log(
        `❌ Video error: ${channel.name}`
      );

      /*
       * Don't change status here.
       *
       * Backend decides whether this is
       * LIVE / VOD / OFFLINE.
       */

      retry();
    };

    video.addEventListener(
      "playing",
      handlePlaying
    );

    video.addEventListener(
      "waiting",
      handleWaiting
    );

    video.addEventListener(
      "error",
      handleVideoError
    );

    /*
     * ==========================================================
     * START HLS PLAYER
     * ==========================================================
     */

    const startPlayer = () => {
      if (destroyed) {
        return;
      }

      console.log(
        `📡 Starting HLS: ${channel.name}`
      );

      /*
       * Connecting only.
       */

      setStatus("loading");

      /*
       * Destroy old HLS instance.
       */

      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }

      /*
       * ========================================================
       * NATIVE HLS
       * ========================================================
       */

      if (
        video.canPlayType(
          "application/vnd.apple.mpegurl"
        )
      ) {
        console.log(
          `🍎 Native HLS: ${channel.name}`
        );

        video.src = streamUrl;

        video.onloadedmetadata = () => {
          if (destroyed) {
            return;
          }

          console.log(
            `📺 Metadata loaded: ${channel.name}`
          );

          video.play().catch(() => {
            console.log(
              `⏳ Playback waiting: ${channel.name}`
            );
          });
        };

        return;
      }

      /*
       * ========================================================
       * HLS.JS
       * ========================================================
       */

      if (Hls.isSupported()) {
        console.log(
          `🌐 hls.js: ${channel.name}`
        );

        const hls = new Hls({
          liveSyncDurationCount: 3,

          enableWorker: true,

          manifestLoadingMaxRetry: 2,

          levelLoadingMaxRetry: 2,

          fragLoadingMaxRetry: 2,

          maxBufferLength: isMain ? 10 : 6,

          backBufferLength: 10,

          capLevelToPlayerSize: true,
        });

        hlsRef.current = hls;

        hls.loadSource(streamUrl);

        hls.attachMedia(video);

        /*
         * ======================================================
         * MANIFEST
         * ======================================================
         */

        hls.on(
          Hls.Events.MANIFEST_PARSED,
          () => {
            if (destroyed) {
              return;
            }

            console.log(
              `📺 Manifest loaded: ${channel.name}`
            );

            video.play().catch(() => {
              console.log(
                `⏳ Playback waiting: ${channel.name}`
              );
            });
          }
        );

        /*
         * ======================================================
         * HLS ERROR
         * ======================================================
         */

        hls.on(
          Hls.Events.ERROR,
          (_event, data) => {
            if (destroyed) {
              return;
            }

            console.log(
              `⚠️ HLS ${channel.name}:`,
              data.type,
              data.details,
              data.fatal
            );

            if (!data.fatal) {
              return;
            }

            /*
             * NETWORK ERROR
             */

            if (
              data.type ===
              Hls.ErrorTypes.NETWORK_ERROR
            ) {
              console.log(
                `🔄 Network recovery: ${channel.name}`
              );

              hls.startLoad();

              retry();

              return;
            }

            /*
             * MEDIA ERROR
             */

            if (
              data.type ===
              Hls.ErrorTypes.MEDIA_ERROR
            ) {
              console.log(
                `🔄 Media recovery: ${channel.name}`
              );

              hls.recoverMediaError();

              return;
            }

            /*
             * OTHER FATAL ERROR
             */

            console.error(
              `❌ Fatal HLS error: ${channel.name}`
            );

            hls.destroy();

            hlsRef.current = null;

            retry();
          }
        );

        return;
      }

      /*
       * ========================================================
       * HLS NOT SUPPORTED
       * ========================================================
       */

      console.error(
        `❌ HLS not supported: ${channel.name}`
      );

      setStatus("offline");
    };

    /*
     * ==========================================================
     * START
     * ==========================================================
     */

    startPlayer();

    /*
     * ==========================================================
     * CHECK STATUS IMMEDIATELY
     * ==========================================================
     */

    checkChannelStatus();

    /*
     * ==========================================================
     * CHECK STATUS EVERY 5 SECONDS
     * ==========================================================
     */

    statusTimerRef.current = setInterval(() => {
      checkChannelStatus();
    }, 5000);

    /*
     * ==========================================================
     * CLEANUP
     * ==========================================================
     */

    return () => {
      destroyed = true;

      video.removeEventListener(
        "playing",
        handlePlaying
      );

      video.removeEventListener(
        "waiting",
        handleWaiting
      );

      video.removeEventListener(
        "error",
        handleVideoError
      );

      cleanup();
    };
  }, [
    channel.id,
    channel.name,
    channel.streamKey,
    isMain,
    streamUrl,
  ]);

  /*
   * ============================================================
   * UI
   * ============================================================
   */

  return (
    <div className="overflow-hidden rounded-xl bg-black">

      <div className="relative aspect-video bg-black">

        <video
          ref={videoRef}
          muted
          autoPlay
          playsInline
          controls={isMain}
          preload="none"
          className="h-full w-full object-contain"
        />

        {/*
         * ======================================================
         * STATUS
         * ======================================================
         */}

        <div className="absolute left-3 top-3">

          {/* LIVE */}

          {status === "live" && (
            <span className="rounded bg-red-600 px-2 py-1 text-xs font-bold text-white">
              ● LIVE
            </span>
          )}

          {/* CONNECTING */}

          {status === "loading" && (
            <span className="rounded bg-yellow-600 px-2 py-1 text-xs font-bold text-white">
              ● CONNECTING
            </span>
          )}

          {/* OFFLINE */}

          {status === "offline" && (
            <span className="rounded bg-gray-700 px-2 py-1 text-xs font-bold text-gray-300">
              ● OFFLINE
            </span>
          )}

          {/*
           * VOD intentionally has NO label.
           *
           * The green circle below indicates
           * that the TV channel is running.
           */}

        </div>

        {/*
         * ======================================================
         * CHANNEL NUMBER
         * ======================================================
         */}

        <div className="absolute bottom-3 left-3 rounded bg-black/70 px-2 py-1 text-xs font-semibold text-white">
          CH {channel.id}
        </div>

      </div>

      {/*
       * ========================================================
       * CHANNEL NAME + STATUS DOT
       * ========================================================
       */}

      <div className="flex items-center justify-between bg-gray-900 px-3 py-2">

        <p className="min-w-0 truncate text-sm font-semibold text-white">
          {channel.name}
        </p>

        <div
          className={`ml-3 h-2.5 w-2.5 shrink-0 rounded-full ${
            status === "live"
              ? "bg-red-500"
              : status === "vod"
              ? "bg-green-500"
              : status === "loading"
              ? "bg-yellow-500"
              : "bg-gray-600"
          }`}
        />

      </div>

    </div>
  );
}