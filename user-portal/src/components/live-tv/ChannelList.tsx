"use client";

import { useState } from "react";
import Image from "next/image";
import { Channel } from "@/types";

interface ChannelListProps {
  channels: Channel[];
  selectedChannel: Channel | null;
  onSelect: (channel: Channel) => void;
}

export default function ChannelList({
  channels,
  selectedChannel,
  onSelect,
}: ChannelListProps) {
  return (
    <div className="space-y-2">
      {channels.map((channel) => {
        const isSelected = selectedChannel?.id === channel.id;
        const isPremium = channel.accessType === "PREMIUM";

        return (
          <button
            key={channel.id}
            type="button"
            onClick={() => onSelect(channel)}
            className={`group relative w-full rounded-xl border p-3 text-left transition-all duration-200 ${
              isSelected
                ? "border-blue-500/50 bg-blue-600/10 shadow-lg shadow-blue-500/5"
                : "border-white/5 bg-[#0d142c] hover:border-white/10 hover:bg-[#121b3b]"
            }`}
          >
            <div className="flex items-center gap-3.5">
              {/* LOGO */}
              <ChannelLogo name={channel.name} logo={channel.logo} />

              {/* CHANNEL NAME & CATEGORY/DETAILS */}
              <div className="min-w-0 flex-1">
                <p
                  className={`truncate text-sm font-semibold transition-colors ${
                    isSelected
                      ? "text-white"
                      : "text-zinc-200 group-hover:text-white"
                  }`}
                >
                  {channel.name}
                </p>
                
              </div>

              {/* ACCESS TYPE BADGE */}
              <div className="flex shrink-0 items-center gap-2">
                {isPremium ? (
                  <span className="rounded-md border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold tracking-wider text-amber-400">
                    PREMIUM
                  </span>
                ) : (
                  <span className="rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold tracking-wider text-emerald-400">
                    FREE
                  </span>
                )}

                {/* ACTIVE INDICATOR */}
                {isSelected && (
                  <span className="h-2 w-2 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50" />
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

{/* ISOLATED LOGO COMPONENT TO HANDLE IMAGE ERRORS CLEANLY */}
function ChannelLogo({ name, logo }: { name: string; logo?: string | null }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-[#070b19] p-1 shadow-inner">
  {logo && !imgError ? (
    <img
      src={logo}
      alt={name}
      className="h-full w-full object-contain"
      onError={() => setImgError(true)}
    />
  ) : (
    <div className="flex h-full w-full items-center justify-center rounded-full bg-blue-500/10 text-xs font-bold text-blue-400">
      {name ? name.slice(0, 2).toUpperCase() : "TV"}
    </div>
  )}
</div>
  );
}