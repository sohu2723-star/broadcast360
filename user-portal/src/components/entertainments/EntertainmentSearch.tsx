"use client";

import { Search } from "lucide-react";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export default function EntertainmentSearch({
  value,
  onChange,
}: Props) {
  return (
    <div className="relative w-full">
      <Search
        size={20}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
      />

      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search entertainment..."
      className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 pl-12 text-white outline-none focus:border-red-500"
      />
    </div>
  );
}