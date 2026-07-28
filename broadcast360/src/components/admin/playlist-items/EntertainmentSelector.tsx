"use client";

import { useEffect, useState } from "react";

interface Entertainment {
  id: number;

  title: string;
}

interface Props {
  value: number | null;

  onSelect: (id: number) => void;
}

export default function EntertainmentSelector({
  value,

  onSelect,
}: Props) {
  const [entertainments, setEntertainments] = useState<Entertainment[]>([]);

  useEffect(() => {
    async function loadEntertainment() {
      try {
        const res = await fetch("/api/entertainments");

        const data = await res.json();

        setEntertainments(data.data ?? []);
      } catch (error) {
        console.error("Failed to load entertainment", error);
      }
    }

    loadEntertainment();
  }, []);

  return (
    <div>
      <label className="mb-2 block text-white">Select Entertainment</label>

      <select
        value={value ?? ""}

        onChange={(e) => onSelect(Number(e.target.value))}

        className="w-full rounded-lg border border-gray-700 bg-[#0B1026] p-3 text-white"
      >
        <option value="">Choose entertainment</option>

        {entertainments.map((item) => (
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
