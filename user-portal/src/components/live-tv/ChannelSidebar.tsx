"use client";

import { useState } from "react";
import { Channel } from "@/types";
import ChannelSearch from "./ChannelSearch";
import ChannelList from "./ChannelList";

interface ChannelSidebarProps {
  channels: Channel[];
  selectedChannel: Channel | null;
  onSelectChannel: (channel: Channel) => void;
  loading: boolean;
  error: string | null;
}

export default function ChannelSidebar({
  channels,
  selectedChannel,
  onSelectChannel,
  loading,
  error,
}: ChannelSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredChannels = channels.filter((channel) =>
    channel.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="w-full lg:w-[380px] bg-[#0b0f19] p-4 rounded-xl border border-gray-800 flex flex-col h-[520px]">
      <ChannelSearch query={searchQuery} setQuery={setSearchQuery} />

      <div className="mt-4 flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
        {loading && (
          <div className="flex flex-col items-center justify-center h-40 text-gray-400">
            <div className="animate-spin rounded-full h-7 w-7 border-t-2 border-b-2 border-blue-500 mb-2"></div>
            <p className="text-xs">Channel Searching...</p>
          </div>
        )}

        {error && !loading && (
          <div className="bg-red-950/40 border border-red-800 text-red-400 p-3 rounded-lg text-center text-xs">
            {error}
          </div>
        )}

        {!loading && !error && filteredChannels.length === 0 && (
          <div className="text-center text-gray-500 py-10 text-xs">
              No channels found for{" "}
              <span className="font-medium">{searchQuery}</span>
          </div>
        )}

        {!loading && !error && filteredChannels.length > 0 && (
          <ChannelList
            channels={filteredChannels}
            selectedChannel={selectedChannel}
            onSelect={onSelectChannel}
          />
        )}
      </div>
    </div>
  );
}
