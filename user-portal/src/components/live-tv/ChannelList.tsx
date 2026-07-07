"use client";

import { Channel } from "@/types";

interface ChannelListProps {
  channels: Channel[];
  selectedChannel: Channel | null;
  onSelect: (channel: Channel) => void;
}

export default function ChannelList({ channels, selectedChannel, onSelect }: ChannelListProps) {
  return (
    <div className="space-y-2">
      {channels.map((channel) => {
        const isSelected = selectedChannel?.id === channel.id;
        return (
          <button
            key={channel.id}
            onClick={() => onSelect(channel)}
            className={`w-full text-left px-4 py-3.5 rounded-lg border text-sm font-medium transition-all duration-150 block ${
              isSelected
                ? "bg-[#161f33] border-blue-600 text-white shadow-md"
                : "bg-[#121824] border-transparent text-gray-300 hover:bg-[#161f32] hover:text-white"
            }`}
          >
            <div className="flex items-center justify-between">
              <span>{channel.name}</span>
              {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>}
            </div>
          </button>
        );
      })}
    </div>
  );
}