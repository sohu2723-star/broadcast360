"use client";

import {
  useEffect,
  useState,
} from "react";

import type { Channel } from "@/types";

import VideoPlayer from "./VideoPlayer";
import ChannelSidebar from "./ChannelSidebar";

import { channelService } from "@/services/channel.service";

export default function LiveTvLayout() {
  const [channels, setChannels] =
    useState<Channel[]>([]);

  const [selectedChannel, setSelectedChannel] =
    useState<Channel | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadChannels() {
      try {
        setLoading(true);
        setError(null);

        const data =
          await channelService.getAllChannels();

        console.log(
          " CHANNELS:",
          data,
        );

        if (!mounted) {
          return;
        }

        /*
         * Backend already provides playbackUrl.
         *
         * Do not check hlsUrl.
         */
        const validChannels =
          data.filter(
            (channel) =>
              Boolean(
                channel.playbackUrl,
              ),
          );

        setChannels(
          validChannels,
        );

        /*
         * Automatically select
         * the first channel.
         */
        if (
          validChannels.length > 0
        ) {
          setSelectedChannel(
            validChannels[0],
          );
        } else {
          setSelectedChannel(null);
        }
      } catch (error) {
        console.error(
          "LOAD CHANNEL FAILED:",
          error,
        );

        if (!mounted) {
          return;
        }

        setError(
          "Cannot fetch channels.",
        );

        setChannels([]);

        setSelectedChannel(null);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadChannels();

    return () => {
      mounted = false;
    };
  }, []);

  function handleSelectChannel(
    channel: Channel,
  ) {
    console.log(
      " Selected channel:",
      channel.name,
      channel.accessType,
    );

    setSelectedChannel(
      channel,
    );
  }

  return (
    <div className="min-h-screen bg-[#05070c] p-6 text-white">
      <div className="mx-auto max-w-[1600px]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-stretch">

          {/* PLAYER */}

          <div className="min-h-[420px] flex-1">
            <VideoPlayer
              channel={
                selectedChannel
              }
            />
          </div>

          {/* CHANNEL SIDEBAR */}

          <div className="w-full lg:w-[340px]">
            <ChannelSidebar
              channels={channels}
              selectedChannel={
                selectedChannel
              }
              onSelectChannel={
                handleSelectChannel
              }
              loading={loading}
              error={error}
            />
          </div>

        </div>
      </div>
    </div>
  );
}