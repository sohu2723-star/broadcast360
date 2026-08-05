"use client";

import { useEffect, useState } from "react";

import ChannelSelector from "@/components/admin/broadcast/ChannelSelector";
import SessionCard from "@/components/admin/broadcast/SessionCard";
import BroadcastControls from "@/components/admin/broadcast/BroadcastControls";

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

    // refresh status every 5 seconds

    const timer = setInterval(() => {
      loadSession(selectedChannelId);
    }, 5000);

    return () => {
      clearInterval(timer);
    };
  }, [selectedChannelId]);

  return (
    <div className="min-h-screen bg-[#010312] p-6 text-white">
      <h1 className="mb-6 text-2xl font-semibold">Broadcast Control</h1>

      {/* CHANNEL SELECT */}

      <div className="max-w-xl">
        <ChannelSelector
          value={selectedChannelId}

          onChange={setSelectedChannelId}
        />
      </div>

      {selectedChannelId > 0 && (
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <SessionCard session={session} />

          <div className="rounded-xl border border-[#106EE9]/20 bg-[#0B1026] p-6">
            <h2 className="text-lg font-semibold">Selected Channel</h2>

            <p className="mt-2 text-[#106EE9]">
              Channel ID: {selectedChannelId}
            </p>

            {loading && (
              <p className="mt-3 text-sm text-gray-400">Loading session...</p>
            )}
          </div>
        </div>

        
      )}

      <BroadcastControls

  channelId={
    selectedChannelId
  }

  status={
    session?.status
  }

  onRefresh={()=>
    loadSession(selectedChannelId)
  }

/>
    </div>
  );
}
