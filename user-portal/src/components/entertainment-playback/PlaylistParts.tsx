"use client";

import Image from "next/image";
import { Play } from "lucide-react";

import type { Entertainment } from "@/types/entertainment";

interface Props {
  entertainments: Entertainment[];
  playlistName: string;
  selectedId?: number;
  onSelect: (item: Entertainment) => void;
}

function formatDuration(seconds?: number | null) {
  if (!seconds) return "00:00:00";

  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return [hrs, mins, secs]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
}

export default function PlaylistParts({
  entertainments,
  playlistName,
  selectedId,
  onSelect,
}: Props) {
  return (
    <div>
    <h2 className="mb-4 text-lg font-bold">
      {playlistName || "Playlist"} Parts
    </h2>
    <div className="space-y-3">
      {entertainments.map((item) => {
        const isActive = selectedId === item.id;

        return (
          <button
            key={item.id}
            onClick={() => onSelect(item)}
            className={`flex w-full gap-3 rounded-lg border p-3 text-left transition ${
              isActive
                ? "border-[#106EE9] bg-[#106EE9]/10"
                : "border-white/10 bg-[#010312] hover:border-[#106EE9]"
            }`}
          >
            {/* Thumbnail */}
            <div className="relative h-14 w-24 shrink-0 overflow-hidden rounded-md">
              <Image
                src={item.thumbnail || "/placeholder.png"}
                alt={item.title}
                fill
                sizes="96px"
                unoptimized
                className="object-cover"
              />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-semibold text-white">
                {item.title}
              </p>

             
              <p className="mt-1 text-xs text-gray-400">
                {formatDuration(item.duration)}
              </p>

              <p className="mt-2 flex items-center gap-1 text-[10px] font-medium uppercase text-[#106EE9]">
                <Play size={11} fill="currentColor" strokeWidth={1.8} aria-hidden="true" />
                <span>{isActive ? "Currently Playing" : "Play Now"}</span>
              </p>
            </div>
          </button>
        );
      })}
    </div>
    </div>
  );
}