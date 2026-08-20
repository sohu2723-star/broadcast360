"use client";

import { useEffect, useState } from "react";

type NowPlayingState = {
  status: string;
  nowPlaying: {
    id: number;
    title: string;
    subtitle: string;
    thumbnail: string | null;
    duration: number;
    type: string;
  } | null;
  nextItem: {
    title: string;
    subtitle: string;
  } | null;
};

export default function NowPlayingCard({ channelId }: { channelId: number }) {
  const [data, setData] = useState<NowPlayingState | null>(null);

  useEffect(() => {
    if (!channelId) return;

    const fetchCurrent = async () => {
      try {
        const res = await fetch(`/api/broadcast/current/${channelId}`);
        const result = await res.json();
        if (result?.data) {
          setData(result.data);
        }
      } catch (err) {
        console.error("Failed to fetch now playing data:", err);
      }
    };

    fetchCurrent();
    const interval = setInterval(fetchCurrent, 3000);
    return () => clearInterval(interval);
  }, [channelId]);

  const current = data?.nowPlaying;

  return (
    <div className="h-full rounded-xl border border-[#4f6689]/20 bg-[#0F172A] p-6 shadow-md flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Now Playing
          </h2>
          {data?.status === "LIVE" ? (
            <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              ON AIR
            </span>
          ) : (
            <span className="text-xs text-slate-500 font-semibold">OFF AIR</span>
          )}
        </div>

        {current ? (
          <div className="mt-4 flex gap-4 items-center">
            {current.thumbnail ? (
              <img
                src={current.thumbnail}
                alt={current.title}
                className="h-20 w-32 rounded-lg object-cover border border-slate-800"
              />
            ) : (
              <div className="h-20 w-32 rounded-lg bg-slate-800 flex items-center justify-center text-xs text-slate-500">
                No Thumbnail
              </div>
            )}
            <div>
              <span className="text-xs font-medium text-sky-400 uppercase tracking-wide">
                {current.subtitle}
              </span>
              <h3 className="text-lg font-bold text-white line-clamp-1">
                {current.title}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Duration: {Math.floor(current.duration / 60)}m {current.duration % 60}s
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-6 text-sm text-slate-500 italic">
            No media active on this channel.
          </div>
        )}
      </div>

      {data?.nextItem && (
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex justify-between items-center text-xs">
          <span className="text-slate-500">Up Next:</span>
          <span className="text-slate-300 font-medium truncate max-w-[200px]">
            {data.nextItem.title}
          </span>
        </div>
      )}
    </div>
  );
}