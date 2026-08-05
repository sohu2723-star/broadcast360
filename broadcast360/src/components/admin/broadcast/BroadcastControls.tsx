"use client";

import { useState } from "react";

interface Props {
  channelId: number;

  status?: "STARTING" | "LIVE" | "SWITCHING" | "STOPPING" | "STOPPED" | "ERROR";

  onRefresh: () => void;
}

export default function BroadcastControls({
  channelId,

  status,

  onRefresh,
}: Props) {
  const [loading, setLoading] = useState(false);

  async function startBroadcast() {
    try {
      setLoading(true);

      const res = await fetch("/api/broadcast/start", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          channelId,
        }),
      });

      const body = await res.json();

      if (!res.ok) {
        throw new Error(body.error || "Start failed");
      }

      console.log("Broadcast started", body);

      onRefresh();
    } catch (error) {
      console.error(error);

      alert(error instanceof Error ? error.message : "Start failed");
    } finally {
      setLoading(false);
    }
  }

  async function stopBroadcast() {
    try {
      setLoading(true);

      const res = await fetch("/api/broadcast/stop", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          channelId,
        }),
      });

      const body = await res.json();

      if (!res.ok) {
        throw new Error(body.error || "Stop failed");
      }

      onRefresh();
    } catch (error) {
      console.error(error);

      alert(error instanceof Error ? error.message : "Stop failed");
    } finally {
      setLoading(false);
    }
  }

  const isRunning =
    status === "LIVE" || status === "STARTING" || status === "SWITCHING";

  return (
    <div className="rounded-xl border border-[#106EE9]/20 bg-[#0B1026] p-6">
      <h2 className="mb-4 text-lg font-semibold">Broadcast Controls</h2>

      <div className="flex gap-3">
        <button
          onClick={startBroadcast}

          disabled={loading || isRunning}

          className="rounded-lg bg-green-600 px-5 py-2 text-sm font-semibold disabled:opacity-40"
        >
          {loading ? "Starting..." : "Start Broadcast"}
        </button>

        <button
          onClick={stopBroadcast}

          disabled={loading || !isRunning}

          className="rounded-lg bg-red-600 px-5 py-2 text-sm font-semibold disabled:opacity-40"
        >
          Stop Broadcast
        </button>
      </div>

      <p className="mt-4 text-sm text-gray-400">
        Current status:
        <span className="ml-2 font-semibold text-white">
          {status ?? "STOPPED"}
        </span>
      </p>
    </div>
  );
}
