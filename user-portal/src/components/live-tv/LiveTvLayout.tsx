"use client";
import { useState, useEffect } from "react";
import { Channel } from "@/types";
import VideoPlayer from "./VideoPlayer";
import { channelService } from "@/services/channel.service";
import ChannelSidebar from "./ChannelSidebar";
import TrendingChannels from "./TrendingChannels";

export default function LiveTvLayout() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        // Call Admin API
        const data = await channelService.getAllChannels();
        
        setChannels(data);
        if (data.length > 0) setSelectedChannel(data[0]);
      } catch (err) {
        setError("Cannot fetch channels");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-[#05070c] text-white p-6">

      {/* Flexible Layout Grid */}
      <div className="flex flex-col lg:flex-row gap-6 items-stretch">
        {/* Left Side: Video Output Container */}
        <VideoPlayer channel={selectedChannel} />
        
        {/* Right Side: Sidebar Controls */}
        <ChannelSidebar
          channels={channels}
          selectedChannel={selectedChannel}
          onSelectChannel={setSelectedChannel}
          loading={loading}
          error={error}
        />
      </div>
      <div>
        <TrendingChannels />
      </div>
    </div>
  );
}