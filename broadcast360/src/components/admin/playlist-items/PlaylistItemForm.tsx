
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ContentSelector from "./ContentSelector";
import { PlaylistItemType } from "@/types/playlist-item";

interface Props {
  programId: number;
  playlistId: number;
}

export default function PlaylistItemForm({
  programId,
  playlistId,
}: Props) {
  const router = useRouter();

  const [type, setType] = useState<PlaylistItemType>("MOVIE");
  const [contentId, setContentId] = useState<number | null>(null);
  const [seriesId, setSeriesId] = useState<number | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    setError("");

    if (!contentId) {
      setError("Please select content before adding.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        `/api/programs/${programId}/playlists/${playlistId}/items`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type,
            contentId,
          }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || "Failed to add playlist item",
        );
      }

      router.push(
        `/admin/programs/${programId}/playlists/${playlistId}`,
      );

      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      {/* TYPE */}
      <div>
        <label className="mb-2 block text-white">
          Content Type
        </label>

        <select
          value={type}
          onChange={(e) => {
            setType(e.target.value as PlaylistItemType);
            setContentId(null);
            setSeriesId(null);
          }}
          className="w-full rounded-lg border border-gray-700 bg-[#0B1026] p-3 text-white"
        >
          <option value="MOVIE">Movie</option>
          <option value="SERIES">Series</option>
          <option value="ADVERTISEMENT">
            Advertisement
          </option>
          <option value="ENTERTAINMENT">
            Entertainment
          </option>
          <option value="NEWS">News</option>
          <option value="STREAM">Stream</option>
        </select>
      </div>

      {/* CONTENT SELECTOR */}
      <ContentSelector
        type={type}
        seriesId={seriesId}
        setSeriesId={setSeriesId}
        value={contentId}
        onSelect={setContentId}
      />

      {/* ERROR */}
      {error && (
        <div className="rounded-lg border border-red-500 bg-red-500/10 p-3 text-red-400">
          {error}
        </div>
      )}

      {/* BUTTONS */}
      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          disabled={loading}
          className="rounded-lg bg-gray-700 px-6 py-3 text-white disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={submit}
          disabled={loading}
          className="rounded-lg bg-[#4f6689] px-6 py-3 text-white disabled:opacity-50"
        >
          {loading ? "Saving..." : "Add Item"}
        </button>
      </div>
    </div>
  );
}