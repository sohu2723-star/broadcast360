"use client";

import { useEffect, useState } from "react";
import ChannelSelector from "@/components/admin/broadcast/ChannelSelector";
import SessionCard from "@/components/admin/broadcast/SessionCard";
import BroadcastControls from "@/components/admin/broadcast/BroadcastControls";
import StreamHealthCard from "@/components/admin/broadcast/StreamHealthCard";
import NowPlayingCard from "@/components/admin/broadcast/NowPlayingCard";
import ScheduleTimeline from "@/components/admin/broadcast/ScheduleTimeline";

type BroadcastSession = {
  id: number;
  channelId: number;
  channel: {
    id: number;
    name: string;
  };
  status: "STARTING" | "LIVE" | "SWITCHING" | "STOPPING" | "STOPPED" | "ERROR";
  startedAt: string | null;
  stoppedAt: string | null;
  currentItemId: number | null;
  errorMessage: string | null;
};

export default function BroadcastPage() {
  const [selectedChannelId, setSelectedChannelId] = useState<number>(0);
  const [session, setSession] = useState<BroadcastSession | null>(null);
  const [loading, setLoading] = useState(false);

  async function loadSession(channelId: number) {
    try {
      setLoading(true);
      const res = await fetch(`/api/broadcast/session/${channelId}`);

      if (!res.ok) {
        setSession(null);
        return;
      }

      const body = await res.json();
      setSession(body.data ?? null);
    } catch (error) {
      console.error("Load session failed", error);
      setSession(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!selectedChannelId) {
      setSession(null);
      return;
    }

    loadSession(selectedChannelId);

    // Refresh status every 5 seconds
    const timer = setInterval(() => {
      loadSession(selectedChannelId);
    }, 5000);

    return () => {
      clearInterval(timer);
    };
  }, [selectedChannelId]);

  return (
    <div className="min-h-screen bg-[#080C19] p-6 text-white font-sans">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-xl border border-[#106EE9]/20 bg-[#0F172A] p-5 shadow-lg">
        <div>
          <h1 className="text-2xl font-bold tracking-wide">Broadcast Playout Control</h1>
          <p className="mt-1 text-xs text-slate-400">
            Live Stream Operations & Real-time Channel Status
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">System Ready</span>
        </div>
      </div>

      {/* CHANNEL SELECT */}
      <div className="max-w-xl">
        <ChannelSelector
          value={selectedChannelId}
          onChange={setSelectedChannelId}
        />
      </div>

      {selectedChannelId > 0 ? (
        <div className="mt-8 space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <SessionCard session={session} />

            <div className="rounded-xl border border-[#106EE9]/20 bg-[#0F172A] p-6 shadow-md flex flex-col justify-between">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#106EE9]">
                  Selected Channel
                </h2>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-slate-400 text-sm">Active Channel ID:</span>
                  <span className="font-mono text-lg font-bold text-white bg-slate-800/80 px-3 py-1 rounded border border-slate-700">
                    #{selectedChannelId}
                  </span>
                </div>
              </div>

              {loading ? (
                <div className="mt-4 flex items-center gap-2 text-xs text-sky-400">
                  <span className="h-2 w-2 rounded-full bg-sky-400 animate-ping" />
                  Updating telemetry...
                </div>
              ) : (
                <div className="mt-4 text-xs text-slate-500">
                  Polling every 5 seconds
                </div>
              )}
            </div>

            <StreamHealthCard health={(session as any)?.health} />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-1">
              <BroadcastControls
                channelId={selectedChannelId}
                status={session?.status}
                onRefresh={() => loadSession(selectedChannelId)}
              />
            </div>
            <div className="lg:col-span-2">
              <NowPlayingCard channelId={selectedChannelId} />
            </div>
          </div>

          <ScheduleTimeline channelId={selectedChannelId} />
        </div>
      ) : (
        <div className="mt-12 rounded-xl border border-dashed border-slate-800 p-12 text-center text-slate-500">
          Select a channel above to load playout telemetry and controls.
        </div>
      )}
    </div>
  );
}