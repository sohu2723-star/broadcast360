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

        setChannels(Array.isArray(list) ? list : []);
      } catch (error) {
        console.error("Failed loading channels", error);
      } finally {
        setLoading(false);
      }
    }

    loadChannels();
  }, []);

  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-[#106EE9]/80 uppercase">
        Broadcast Channel
      </label>

      <select
        value={value || ""}

        onChange={(e) => {
          onChange(Number(e.target.value));
        }}

        disabled={loading}

        className="h-11 w-full rounded-lg border border-[#106EE9]/30 bg-[#010312] px-3 text-sm text-white"
      >
        <option value="">Select Channel</option>

        {channels.map((channel) => (
          <option key={channel.id} value={channel.id}>
            {channel.name}
          </option>
        ))}
      </select>
    </div>
  );
}
