"use client";

import { useEffect, useState } from "react";

interface Ad {
  id: number;
  title: string;
}

interface Props {
  value: number | null;
  onSelect: (id: number) => void;
}

export default function AdSelector({ value, onSelect }: Props) {
  // 1. Setup state to hold the real ads data
  const [ads, setAds] = useState<Ad[]>([]);

  // 2. Fetch the real data when the component loads
  useEffect(() => {
    async function loadAds() {
      try {
        const res = await fetch("/api/ads"); // Make sure this matches your API route
        const data = await res.json();
        
        // Match the data structure pattern you used in MovieSelector
        setAds(data.data ?? []);
      } catch (error) {
        console.error("Failed to load ads:", error);
      }
    }

    loadAds();
  }, []);

  return (
    <div className="space-y-2">
      <label className="block text-white">
        Select Advertisement
      </label>

      <select
        value={value ?? ""}
        onChange={(e) => onSelect(Number(e.target.value))}
        className="w-full bg-[#0B1026] text-white border border-gray-700 rounded-lg p-3"
      >
        <option value="">Choose Ad</option>

        {ads.map((ad) => (
          <option key={ad.id} value={ad.id}>
            {ad.title}
          </option>
        ))}
      </select>
    </div>
  );
}