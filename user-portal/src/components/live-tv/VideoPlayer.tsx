"use client";

import { Channel } from "@/types";

interface VideoPlayerProps {
  channel: Channel | null;
}

export default function VideoPlayer({ channel }: VideoPlayerProps) {
  return (
    <div className="flex-1 bg-[#0b0f19] rounded-xl border border-gray-800 overflow-hidden flex flex-col h-[520px]">
      {/* Black Player Container */}
      <div className="flex-1 bg-black relative flex items-center justify-center text-gray-400 font-medium">
        {channel ? (
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-1">🎬 Live Video Player Mode</p>
            <p className="text-xs font-mono text-gray-600 bg-[#121824] px-3 py-1 rounded">
              Source: {channel.streamUrl}
            </p>
          </div>
        ) : (
          <p className="text-sm">Please select a channel to watch</p>
        )}
      </div>

      {/* Video Footer Info */}
      <div className="p-5 flex items-center justify-between border-t border-gray-800 bg-[#0b0f19]">
        <div>
          <h2 className="text-lg font-bold">{channel ? channel.name : "No Channel Selected"}</h2>
          <p className="text-xs text-gray-400 mt-1">{channel?.description || "Breaking News Live"}</p>
        </div>
        {channel && (
          <div className="flex items-center gap-2 bg-red-950/50 border border-red-800 px-3 py-1.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            <span className="text-xs font-semibold text-red-400 tracking-wider">LIVE</span>
          </div>
        )}
      </div>
    </div>
  );
}
