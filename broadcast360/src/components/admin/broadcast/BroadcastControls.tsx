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
    <div className="h-full rounded-xl border border-[#106EE9]/20 bg-[#0F172A] p-6 shadow-md flex flex-col justify-between">
      <div>
        <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-[#106EE9]">
          Broadcast Controls
        </h2>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={startBroadcast}
            disabled={loading || isRunning || !channelId}
            className="rounded-lg bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 py-2.5 text-sm font-semibold text-white transition disabled:opacity-40"
          >
            {loading ? "Starting..." : "Start Broadcast"}
          </button>

          <button
            onClick={stopBroadcast}
            disabled={loading || !isRunning}
            className="rounded-lg bg-rose-600 hover:bg-rose-500 active:bg-rose-700 py-2.5 text-sm font-semibold text-white transition disabled:opacity-40"
          >
            Stop Broadcast
          </button>
        </div>
      </div>

      <div className="mt-6 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
        <span>Channel: #{channelId || "None"}</span>
        <span>
          Status:{" "}
          <strong className="font-semibold text-white">
            {status ?? "STOPPED"}
          </strong>
        </span>
      </div>
    </div>
  );
}