
"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import Hls from "hls.js";

import type { Channel } from "@/types";

import {
  channelService,
  ChannelAccessError,
} from "@/services/channel.service";

interface Props {
  channel: Channel | null;
}

type AccessState =
  | "idle"
  | "checking"
  | "allowed"
  | "login_required"
  | "premium_required"
  | "error";

export default function VideoPlayer({
  channel,
}: Props) {
  const videoRef =
    useRef<HTMLVideoElement>(null);

  const hlsRef =
    useRef<Hls | null>(null);

  const [accessState, setAccessState] =
    useState<AccessState>("idle");

  const [accessChannel, setAccessChannel] =
    useState<any>(null);

  const [message, setMessage] =
    useState("");

  /*
   * =====================================================
   * CLEANUP
   * =====================================================
   */

  function destroyPlayer() {
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const video = videoRef.current;

    if (video) {
      video.pause();
      video.removeAttribute("src");
      video.load();
    }
  }

  /*
   * =====================================================
   * CHECK ACCESS
   * =====================================================
   */

  useEffect(() => {
    let cancelled = false;

    async function checkAccess() {
      destroyPlayer();

      setAccessChannel(null);
      setMessage("");

      if (!channel) {
        setAccessState("idle");
        return;
      }

      setAccessState("checking");

      try {
        console.log(
          "🔐 Checking access:",
          channel.name,
          channel.accessType,
        );

        const result =
          await channelService.getChannelAccess(
            channel.id,
          );

        if (cancelled) {
          return;
        }

        console.log(
          "✅ Channel access result:",
          result,
        );

        if (result.allowed) {
          setAccessChannel(result);
          setAccessState("allowed");
          return;
        }

        setAccessState("error");
        setMessage(
          "Channel access was not granted.",
        );
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error(
          "❌ CHANNEL ACCESS FAILED:",
          error,
        );

        if (
          error instanceof ChannelAccessError
        ) {
          if (error.status === 401) {
            setAccessState(
              "login_required",
            );

            setMessage(
              error.data?.message ??
                "Please login to watch this premium channel.",
            );

            return;
          }

          if (error.status === 403) {
            setAccessState(
              "premium_required",
            );

            setMessage(
              error.data?.message ??
                "Premium subscription required.",
            );

            return;
          }
        }

        setAccessState("error");

        setMessage(
          error instanceof Error
            ? error.message
            : "Cannot access this channel.",
        );
      }
    }

    checkAccess();

    return () => {
      cancelled = true;
      destroyPlayer();
    };
  }, [channel?.id]);

  /*
   * =====================================================
   * START HLS
   * =====================================================
   */

  useEffect(() => {
    if (
      accessState !== "allowed" ||
      !accessChannel?.playbackUrl
    ) {
      return;
    }

    const video = videoRef.current;

    if (!video) {
      return;
    }

    const streamUrl =
      accessChannel.playbackUrl;

    console.log(
      "▶️ Starting HLS:",
      streamUrl,
    );

    let hls: Hls | null = null;

    if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
        liveSyncDurationCount: 3,
        maxBufferLength: 30,
      });

      hlsRef.current = hls;

      hls.loadSource(streamUrl);
      hls.attachMedia(video);

      hls.on(
        Hls.Events.MANIFEST_PARSED,
        () => {
          console.log(
            "✅ HLS manifest loaded:",
            accessChannel.name,
          );

          video
            .play()
            .catch(() => {});
        },
      );

      hls.on(
        Hls.Events.ERROR,
        (_, data) => {
          if (!data.fatal) {
            return;
          }

          console.error(
            "❌ HLS ERROR:",
            data,
          );

          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls?.startLoad();
              break;

            case Hls.ErrorTypes.MEDIA_ERROR:
              hls?.recoverMediaError();
              break;

            default:
              hls?.destroy();
              hlsRef.current = null;
              break;
          }
        },
      );
    } else if (
      video.canPlayType(
        "application/vnd.apple.mpegurl",
      )
    ) {
      video.src = streamUrl;

      video
        .play()
        .catch(() => {});
    }

    return () => {
      if (hls) {
        hls.destroy();
      }

      if (hlsRef.current === hls) {
        hlsRef.current = null;
      }

      video.pause();
      video.removeAttribute("src");
      video.load();
    };
  }, [
    accessState,
    accessChannel?.playbackUrl,
  ]);

  useEffect(() => {
    if (accessState !== "allowed" || !channel?.id) {
      return;
    }

    const randomPart = typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const sessionKey = `live-${channel.id}-${randomPart}`;
    const viewerKey = typeof window !== "undefined" && window.localStorage.getItem("broadcast360_viewer_key")
      ? window.localStorage.getItem("broadcast360_viewer_key")!
      : `viewer-${randomPart}`;

    if (typeof window !== "undefined" && !window.localStorage.getItem("broadcast360_viewer_key")) {
      window.localStorage.setItem("broadcast360_viewer_key", viewerKey);
    }

    let disposed = false;
    const send = (event: "start" | "heartbeat" | "end", keepalive = false) => {
      if (disposed && event !== "end") return;
      return fetch("/api/analytics/live-view", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        keepalive,
        body: JSON.stringify({ channelId: channel.id, sessionKey, viewerKey, event }),
      }).catch(() => undefined);
    };

    void send("start");
    const interval = window.setInterval(() => void send("heartbeat"), 30_000);

    return () => {
      disposed = true;
      window.clearInterval(interval);
      void send("end", true);
    };
  }, [accessState, channel?.id]);

  /*
   * =====================================================
   * NO CHANNEL
   * =====================================================
   */

  if (!channel) {
    return (
      <div className="flex min-h-[420px] flex-1 items-center justify-center rounded-xl bg-black text-gray-400">
        Select a channel
      </div>
    );
  }

  /*
   * =====================================================
   * CHECKING
   * =====================================================
   */

  if (accessState === "checking") {
    return (
      <PlayerMessage
        title="Checking channel access"
        message="Please wait..."
      />
    );
  }

  /*
   * =====================================================
   * LOGIN REQUIRED
   * =====================================================
   */

  if (
    accessState === "login_required"
  ) {
    return (
      <PlayerMessage
        title="Login Required"
        message={
          message ||
          "Please login to watch this premium channel."
        }
        buttonText="Login"
        buttonHref="/login"
      />
    );
  }

  /*
   * =====================================================
   * PREMIUM REQUIRED
   * =====================================================
   */

  if (
    accessState === "premium_required"
  ) {
    return (
      <PlayerMessage
        title="Premium Channel"
        message={
          message ||
          "This channel is available for Premium subscribers only."
        }
        buttonText="Get Premium"
        buttonHref="/subscription"
      />
    );
  }

  /*
   * =====================================================
   * ERROR
   * =====================================================
   */

  if (accessState === "error") {
    return (
      <PlayerMessage
        title="Unable to play"
        message={
          message ||
          "Cannot access this channel."
        }
      />
    );
  }

  /*
   * =====================================================
   * PLAYER
   * =====================================================
   */

  return (
    <div className="relative flex min-h-[420px] flex-1 overflow-hidden rounded-xl bg-black">
      <video
        ref={videoRef}
        controls
        autoPlay
        playsInline
        controlsList="nodownload noplaybackrate"
        className="h-full w-full object-contain"
      />

      {/* CHANNEL INFO */}
      <div className="absolute left-4 top-4 z-10 flex items-center justify-center">
  {accessChannel?.logo ? (
    <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/20 bg-black/80 p-1 shadow-lg backdrop-blur-md transition-transform hover:scale-105">
      <img
        src={accessChannel.logo}
        alt={accessChannel?.name || "Channel Logo"}
        className="h-full w-full object-contain"
      />
    </div>
  ) : (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/20 bg-black/80 text-xs font-bold text-white shadow-lg backdrop-blur-md">
      TV
    </div>
  )}
</div>
    </div>
  );
}

/*
 * =====================================================
 * PLAYER MESSAGE
 * =====================================================
 */

function PlayerMessage({
  title,
  message,
  buttonText,
  buttonHref,
}: {
  title: string;
  message: string;
  buttonText?: string;
  buttonHref?: string;
}) {
  return (
    <div className="flex min-h-[420px] flex-1 items-center justify-center rounded-xl bg-black p-8">
      <div className="max-w-md text-center">

        <h2 className="text-xl font-bold text-white">
          {title}
        </h2>

        <p className="mt-3 text-sm leading-6 text-gray-400">
          {message}
        </p>

        {buttonText && buttonHref && (
          <a
            href={buttonHref}
            className="mt-6 inline-block rounded-lg bg-yellow-500 px-6 py-3 text-sm font-bold text-black transition hover:bg-yellow-400"
          >
            {buttonText}
          </a>
        )}
      </div>
    </div>
  );
}
