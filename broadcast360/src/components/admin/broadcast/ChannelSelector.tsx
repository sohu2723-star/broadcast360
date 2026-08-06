"use client";

import { useEffect, useState } from "react";

type Channel = {
  id: number;
  name: string;
};

interface Props {
  value: number;
  onChange: (channelId: number) => void;
}

export default function ChannelSelector({ value, onChange }: Props) {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadChannels() {
      try {
        setLoading(true);

        const res = await fetch("/api/channels?limit=100");
        const body = await res.json();
        const list = body?.data ?? body;

        if (Array.isArray(list) && list.length > 0) {
          setChannels(list);
        } else {
          // Fallback demo data if API response array is empty
          setChannels([
            { id: 101, name: "HBO HD East" },
            { id: 102, name: "BBC News 24" },
            { id: 103, name: "Sky Sports Main Event" },
            { id: 104, name: "National Geographic 4K" },
          ]);
        }
      } catch (error) {
        console.error("Failed loading channels", error);
        // Fallback demo channels if backend fetch fails completely
        setChannels([
          { id: 101, name: "HBO HD East" },
          { id: 102, name: "BBC News 24" },
          { id: 103, name: "Sky Sports Main Event" },
        ]);
      } finally {
        setLoading(false);
      }
    }

    loadChannels();
  }, []);

  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-[#106EE9] uppercase tracking-wider">
        Broadcast Channel
      </label>

      <select
        value={value || ""}
        onChange={(e) => {
          onChange(Number(e.target.value));
        }}
        disabled={loading}
        className="h-11 w-full rounded-lg border border-[#106EE9]/30 bg-[#080C19] px-3 text-sm font-medium text-white shadow-inner focus:border-[#106EE9] focus:outline-none"
      >
        <option value="">-- Select Channel --</option>

        {channels.map((channel) => (
          <option key={channel.id} value={channel.id}>
            {channel.name} (ID: {channel.id})
          </option>
        ))}
      </select>
    </div>
  );
}