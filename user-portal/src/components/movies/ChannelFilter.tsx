"use client";

import type { Channel } from "@/types";

interface Props {
  value: string;

  channels: Channel[];

  onChange: (value: string) => void;
}

export default function ChannelFilter({
  value,

  channels,

  onChange,
}: Props) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-xl bg-neutral-900 border border-neutral-800 px-4 py-3 text-white outline-none focus:border-blue-500"
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
