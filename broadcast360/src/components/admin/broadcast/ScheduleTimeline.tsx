"use client";

import { useEffect, useState, useRef } from "react";

type ScheduleEntry = {
  id: number;
  status: "COMPLETED" | "LIVE" | "SCHEDULED";
  startTime: string;
  endTime: string;
  programTitle: string;
  programType: string;
  playlistName: string;
};

export default function HorizontalScheduleTimeline({
  channelId,
}: {
  channelId: number;
}) {
  const [schedules, setSchedules] = useState<ScheduleEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!channelId) return;

    const fetchSchedule = async () => {
      try {
        const res = await fetch(`/api/broadcast/schedule/${channelId}`);
        const result = await res.json();

        // Combine previous and upcoming into a single chronological array
        if (result?.data) {
          const combined = [
            ...(result.data.previous || []),
            ...(result.data.upcoming || []),
          ];
          setSchedules(combined);
        }
      } catch (err) {
        console.error("Error loading horizontal timeline:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
    const interval = setInterval(fetchSchedule, 3000);
    return () => clearInterval(interval);
  }, [channelId]);

  // Center the LIVE block on screen automatically
  useEffect(() => {
    if (containerRef.current) {
      const liveElement = containerRef.current.querySelector(".is-live");
      if (liveElement) {
        liveElement.scrollIntoView({
          behavior: "smooth",
          inline: "center",
          block: "nearest",
        });
      }
    }
  }, [schedules]);

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="w-full rounded-xl border border-slate-800 bg-[#0F172A] p-6 text-slate-200">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
            Schedule Playout Timeline
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Control view: Past (15m) → NOW → Upcoming (15m)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            Live Playout Active
          </span>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-slate-500">
          Loading schedule timeline...
        </div>
      ) : schedules.length === 0 ? (
        <div className="py-12 text-center text-xs text-slate-500 italic">
          No schedules found in this 30-minute window.
        </div>
      ) : (
        /* Horizontal Scrollable Bar */
        <div
          ref={containerRef}
          className="flex items-stretch gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-slate-700"
        >
          {schedules.map((item) => {
            const isLive = item.status === "LIVE";
            const isCompleted = item.status === "COMPLETED";

            return (
              <div
                key={item.id}
                className={`min-w-[280px] max-w-[320px] flex-shrink-0 rounded-xl border p-4 flex flex-col justify-between transition-all ${
                  isLive
                    ? "is-live bg-[#4f6689]/15 border-[#4f6689] shadow-lg shadow-[#4f6689]/20 ring-1 ring-[#4f6689]"
                    : isCompleted
                    ? "bg-slate-900/40 border-slate-800 opacity-60"
                    : "bg-slate-900 border-slate-800"
                }`}
              >
                <div>
                  {/* Status & Time Header */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-xs font-bold text-slate-400">
                      {formatTime(item.startTime)} - {formatTime(item.endTime)}
                    </span>

                    {isLive ? (
                      <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30 animate-pulse">
                        ● LIVE
                      </span>
                    ) : isCompleted ? (
                      <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-400 border border-slate-700">
                        ENDED
                      </span>
                    ) : (
                      <span className="rounded bg-sky-500/20 px-2 py-0.5 text-[10px] font-medium text-sky-400 border border-sky-500/30">
                        UPCOMING
                      </span>
                    )}
                  </div>

                  {/* Program Title */}
                  <div className="text-[11px] font-semibold text-sky-400 uppercase tracking-wide">
                    {item.programType}
                  </div>
                  <h3 className="text-base font-bold text-white mt-0.5 line-clamp-1">
                    {item.programTitle}
                  </h3>
                </div>

                {/* Footer Playlist Info */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <span className="truncate">{item.playlistName}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}