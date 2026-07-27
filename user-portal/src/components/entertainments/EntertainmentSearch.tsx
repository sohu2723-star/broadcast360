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
        placeholder="Search by title or category..."
        className="w-full rounded-2xl border border-slate-700 bg-[#0F172A] py-4 pl-12 pr-4 text-white placeholder:text-slate-400 outline-none transition-all duration-300 focus:border-[#106EE9] focus:ring-2 focus:ring-[#106EE9]/30"
      />
    </div>
  );
}