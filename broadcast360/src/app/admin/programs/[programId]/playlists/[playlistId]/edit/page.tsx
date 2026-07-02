"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function EditPlaylistPage() {
  const router = useRouter();
  const params = useParams();

  const programId = params.programId as string;
  const playlistId = params.playlistId as string;

  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Load current playlist
  useEffect(() => {
    async function loadPlaylist() {
      try {
        const res = await fetch(
          `/api/programs/${programId}/playlists/${playlistId}`
        );

        const data = await res.json();

        if (!res.ok) {
          setError(data.message ?? "Failed to load playlist");
          return;
        }

        setName(data.data.name);
      } catch {
        setError("Failed to load playlist");
      }
    }

    loadPlaylist();
  }, [programId, playlistId]);

  async function submit() {
    setError("");

    if (!name.trim()) {
      setError("Playlist name is required");
      return;
    }

    if (name.trim().length < 3) {
      setError("Playlist name must be at least 3 characters");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        `/api/programs/${programId}/playlists/${playlistId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: name.trim(),
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(
          data.errors?.name?.[0] ??
            data.message ??
            "Failed to update playlist"
        );
        setLoading(false);
        return;
      }

      router.back();
      router.refresh();
    } catch {
      setError("Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#010312] p-8">
      <div className="max-w-xl bg-[#0B1026] p-6 rounded-xl">
        <h1 className="text-white text-2xl font-semibold mb-6">
          Edit Playlist
        </h1>

        {error && (
          <p className="text-[#F41010] mb-3">
            {error}
          </p>
        )}

        <input
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError("");
          }}
          placeholder="Playlist name"
          className="
            w-full
            p-3
            rounded-lg
            bg-[#010312]
            text-white
            border
            border-gray-700
            focus:border-[#106EE9]
            outline-none
          "
        />

        <div className="flex gap-3 mt-6">
          <button
            type="button"
            onClick={() => router.back()}
            className="
              bg-gray-700
              text-white
              px-5
              py-2
              rounded-lg
            "
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={submit}
            disabled={loading}
            className="
              bg-[#106EE9]
              text-white
              px-5
              py-2
              rounded-lg
              disabled:opacity-50
            "
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}