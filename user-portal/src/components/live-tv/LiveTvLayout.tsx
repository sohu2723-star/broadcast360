"use client";

import { useEffect, useState } from "react";

import { Channel } from "@/types";

import VideoPlayer from "./VideoPlayer";
import ChannelSidebar from "./ChannelSidebar";

import { channelService } from "@/services/channel.service";


export default function LiveTvLayout() {
  const [channels, setChannels] = useState<Channel[]>([]);

  const [selectedChannel, setSelectedChannel] =
    useState<Channel | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);


  useEffect(() => {

    async function loadChannels() {

      try {

        setLoading(true);

        setError(null);


        const data = await channelService.getAllChannels();


        console.log("CHANNELS:", data);


        const validChannels = data.filter(
          (channel) =>
            channel.streamKey
        );


        setChannels(validChannels);


        if (validChannels.length > 0) {

          setSelectedChannel(validChannels[0]);

        }


      } catch (error) {

        console.error(
          "LOAD CHANNEL FAILED:",
          error
        );

        setError(
          "Cannot fetch channels"
        );

      } finally {

        setLoading(false);

      }

    }


    loadChannels();

  }, []);



  return (

    <div
      className="
      min-h-screen
      bg-[#05070c]
      text-white
      p-6
      "
    >

      <div
        className="
        flex
        flex-col
        lg:flex-row
        gap-6
        items-stretch
        "
      >


        <VideoPlayer
          channel={selectedChannel}
        />


        <ChannelSidebar

          channels={channels}

          selectedChannel={selectedChannel}

          onSelectChannel={
            setSelectedChannel
          }

          loading={loading}

          error={error}

        />


      </div>
    </div>

  );
}