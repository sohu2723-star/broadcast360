"use client";

import { useEffect, useState } from "react";

interface Series {
  id: number;
  title: string;
}

interface Props {
  value: number | null;
  onSelect: (id: number) => void;
}

export default function SeriesSelector({
  value,
  onSelect,
}: Props) {
  const [series, setSeries] = useState<Series[]>([]);

  useEffect(() => {
    async function loadSeries() {
      const res = await fetch("/api/series");
      const data = await res.json();

      setSeries(data.data ?? []);
    }

    loadSeries();
  }, []);

  return (
    <div>
      <label className="block text-white mb-2">
        Select Series
      </label>

      <select
        value={value ?? ""}
        onChange={(e) =>
          onSelect(Number(e.target.value))
        }
        className="
          w-full
          bg-[#0B1026]
          text-white
          border
          border-gray-700
          rounded-lg
          p-3
        "
      >
        <option value="">
          Choose Series
        </option>

        {series.map((item) => (
          <option
            key={item.id}
            value={item.id}
          >
            {item.title}
          </option>
        ))}
      </select>
    </div>
  );
}