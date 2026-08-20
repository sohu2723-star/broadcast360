"use client";

import React, { useEffect, useState } from "react";

export type ScheduleDetailsProps = {
  scheduleData?: {
    id: string;
    dbId: number;
    channelName: string;
    programName: string;
    playlistName: string;
    startTime: string;
    endTime: string;
    status: "LIVE" | "PENDING" | "COMPLETED" | "ERROR";
    relationalKeys: {
      channelId: number;
      programId: number | null;
      playlistId: number;
    };
    telemetry?: {
      elapsedMinutes: number;
      remainingMinutes: number;
      progressPercent: number;
    };
    assetMeta?: {
      codec: string;
      resolution: string;
      bitrate: string;
      totalItems?: number;
      itemTitles?: string[];
    };
  };
  onEdit?: () => void;
  onForceSkip?: () => void;
  onEmergencyStop?: () => void;
};

export default function ScheduleDetailsView({
  scheduleData,
  onEdit,
  onForceSkip,
  onEmergencyStop,
}: ScheduleDetailsProps) {
  const [formattedTimes, setFormattedTimes] = useState<{
    start: string;
    end: string;
  }>({ start: "Loading...", end: "Loading..." });

  // Prevent SSR/Client hydration mismatch on localized dates
  useEffect(() => {
    if (scheduleData) {
      setFormattedTimes({
        start: new Date(scheduleData.startTime).toLocaleString([], {
          dateStyle: "medium",
          timeStyle: "short",
        }),
        end: new Date(scheduleData.endTime).toLocaleString([], {
          dateStyle: "medium",
          timeStyle: "short",
        }),
      });
    }
  }, [scheduleData?.startTime, scheduleData?.endTime]);

  if (!scheduleData) {
    return (
      <div className="flex items-center justify-center p-8 text-xs font-mono text-zinc-500 bg-[#010312] min-h-screen">
        No schedule data loaded.
      </div>
    );
  }

  const { status, telemetry, assetMeta, relationalKeys } = scheduleData;

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-4 sm:p-6 text-[#FFFFFF] bg-[#010312] min-h-screen">
      {/* 1. HERO HEADER BANNER */}
      <div className="w-full bg-[#0B1026] border border-[#4f6689]/30 rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold tracking-widest text-[#4f6689] uppercase bg-[#4f6689]/10 px-2.5 py-1 rounded border border-[#4f6689]/20 font-mono">
              {scheduleData.id}
            </span>

            {/* Dynamic Status Pill */}
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded flex items-center gap-1.5 border font-mono ${
                status === "LIVE"
                  ? "bg-[#1CFE10]/10 border-[#1CFE10] text-[#1CFE10]"
                  : status === "COMPLETED"
                  ? "bg-slate-800 border-slate-700 text-slate-400"
                  : "bg-sky-500/10 border-sky-500/40 text-sky-400"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  status === "LIVE"
                    ? "bg-[#1CFE10] animate-pulse"
                    : status === "COMPLETED"
                    ? "bg-slate-500"
                    : "bg-sky-400"
                }`}
              />
              {status} STATUS
            </span>
          </div>

          <h1 className="text-2xl font-extrabold tracking-tight mt-2">
            {scheduleData.programName}
          </h1>
          <p className="text-sm text-zinc-400">
            Target Channel:{" "}
            <span className="text-[#FFFFFF] font-medium">
              {scheduleData.channelName}
            </span>
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <button
            onClick={onEdit}
            className="flex-1 sm:flex-initial px-4 h-10 bg-[#010312] hover:bg-[#4f6689]/10 border border-[#4f6689]/40 rounded-lg text-sm font-medium transition-all"
          >
            Modify Window
          </button>
          <button
            onClick={onForceSkip}
            className="flex-1 sm:flex-initial px-4 h-10 bg-gradient-to-r from-[#4f6689] to-[#400FD3] hover:opacity-90 rounded-lg text-sm font-medium transition-all shadow-md shadow-[#400FD3]/20"
          >
            Force Skip Asset
          </button>
        </div>
      </div>

      {/* 2. TWO-COLUMN TELEMETRY DISPLAY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT/CENTER: SPECS & TIMELINE */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#0B1026] border border-[#4f6689]/15 rounded-xl p-6 space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#4f6689]">
              Playout Timeline Configuration
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-4 bg-[#010312] border border-[#4f6689]/10 rounded-lg">
                <span className="text-xs text-zinc-400 block mb-1">
                  Scheduled Start
                </span>
                <span className="font-mono text-base font-semibold">
                  {formattedTimes.start}
                </span>
              </div>
              <div className="p-4 bg-[#010312] border border-[#4f6689]/10 rounded-lg">
                <span className="text-xs text-zinc-400 block mb-1">
                  Scheduled End
                </span>
                <span className="font-mono text-base font-semibold">
                  {formattedTimes.end}
                </span>
              </div>
            </div>

            {/* Live Telemetry Progress Bar */}
            {status === "LIVE" && telemetry && (
              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-xs font-mono text-zinc-400">
                  <span>Elapsed: {telemetry.elapsedMinutes}m</span>
                  <span className="text-[#1CFE10]">
                    Progress ({telemetry.progressPercent}%)
                  </span>
                  <span>Remaining: {telemetry.remainingMinutes}m</span>
                </div>
                <div className="w-full h-2 bg-[#010312] rounded-full overflow-hidden border border-[#4f6689]/10">
                  <div
                    className="h-full bg-gradient-to-r from-[#4f6689] to-[#1CFE10] transition-all duration-500 rounded-full animate-pulse"
                    style={{ width: `${telemetry.progressPercent}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Database Relational Keys */}
          <div className="bg-[#0B1026] border border-[#4f6689]/15 rounded-xl p-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#4f6689] mb-4">
              Relational Database Micro-Keys
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
              <div className="p-3 bg-[#010312] rounded-lg border border-zinc-800 flex justify-between items-center">
                <span className="text-zinc-500">channel_id:</span>
                <span className="text-white font-bold">
                  {relationalKeys.channelId}
                </span>
              </div>
              <div className="p-3 bg-[#010312] rounded-lg border border-zinc-800 flex justify-between items-center">
                <span className="text-zinc-500">program_id:</span>
                <span className="text-white font-bold">
                  {relationalKeys.programId ?? "N/A"}
                </span>
              </div>
              <div className="p-3 bg-[#010312] rounded-lg border border-zinc-800 flex justify-between items-center">
                <span className="text-zinc-500">playlist_id:</span>
                <span className="text-white font-bold">
                  {relationalKeys.playlistId}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: ASSETS & EMERGENCY TERMINATION */}
        <div className="space-y-6">
          <div className="bg-[#0B1026] border border-[#4f6689]/15 rounded-xl p-6 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#4f6689]">
              Source Asset Target
            </h3>
            <div className="space-y-1.5">
              <span className="text-xs text-zinc-400 block">
                Linked Playlist Bundle
              </span>
              <p className="text-sm font-medium bg-[#010312] p-3 rounded-lg border border-[#4f6689]/10 font-mono break-all">
                {scheduleData.playlistName}
              </p>
            </div>

            {assetMeta && (
              <div className="border-t border-[#4f6689]/10 pt-4 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Total Playlist Items:</span>
                  <span className="font-mono">{assetMeta.totalItems ?? 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Stream Codec:</span>
                  <span className="font-mono">{assetMeta.codec}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Target Output:</span>
                  <span className="font-mono">{assetMeta.resolution}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Network Bitrate:</span>
                  <span className="font-mono text-[#1CFE10]">
                    {assetMeta.bitrate}
                  </span>
                </div>

                {/* Playlist Item Snippet Preview */}
                {assetMeta.itemTitles && assetMeta.itemTitles.length > 0 && (
                  <div className="pt-2">
                    <span className="text-zinc-400 block mb-1">
                      Queued Assets:
                    </span>
                    <ul className="space-y-1 bg-[#010312] p-2 rounded border border-zinc-800 text-[11px] text-zinc-300">
                      {assetMeta.itemTitles.map((title, idx) => (
                        <li key={idx} className="truncate">
                          • {title}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}