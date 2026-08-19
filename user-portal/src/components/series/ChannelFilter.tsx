"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

interface Channel {
  id: string;

  name: string;
}

interface Props {
  value?: number;

  onChange: (id?: number) => void;
}

export default function ChannelFilter({
  value,

  onChange,
}: Props) {
  const [channels, setChannels] = useState<Channel[]>([]);

  useEffect(() => {
    loadChannels();
  }, []);

  async function loadChannels() {
    try {
      const response = await api.get("/api/user-portal/channels");

      setChannels(response.data);
    } catch (error) {
      console.error("Failed to load channels:", error);
    }
  }

  return (
    <select
      value={value ?? ""}
      onChange={(e) => {
        const id = e.target.value;

        onChange(id ? Number(id) : undefined);
      }}
      className="
        rounded-lg
        border
        border-zinc-700
        bg-zinc-900
        px-4
        py-3
        text-white
        outline-none
      "
    >
      <option value="">All Channels</option>

      {channels.map((channel) => (
        <option key={channel.id} value={channel.id}>
          {channel.name}
        </option>
      ))}
    </select>
  );
}
