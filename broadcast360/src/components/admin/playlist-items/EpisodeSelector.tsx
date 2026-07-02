"use client";

import { useEffect, useState } from "react";

interface Episode {
  id: number;
  title: string;
}

interface Props {
  seriesId: number | null;
  value: number | null;
  onSelect: (id: number) => void;
}

export default function EpisodeSelector({
  seriesId,
  value,
  onSelect,
}: Props) {
  const [episodes, setEpisodes] = useState<Episode[]>([]);

  useEffect(() => {
    if (!seriesId) return;

    async function loadEpisodes() {
      const res = await fetch(
        `/api/series/${seriesId}/episodes`
      );

      const data = await res.json();

      setEpisodes(data.data ?? []);
    }

    loadEpisodes();
  }, [seriesId]);

  return (
    <div>
      <label className="block text-white mb-2">
        Select Episode
      </label>

      <select
        disabled={!seriesId}
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
          Choose Episode
        </option>

        {episodes.map((episode) => (
          <option
            key={episode.id}
            value={episode.id}
          >
            {episode.title}
          </option>
        ))}
      </select>
    </div>
  );
}