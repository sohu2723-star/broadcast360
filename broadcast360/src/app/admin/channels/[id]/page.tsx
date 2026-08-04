"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type Playlist = {
  id: number;
  name: string;
  totalDuration: number | null;
};

type Channel = {
  id: number;
  name: string;
  streamKey: string;
  description: string | null;
  logo: string | null;
  country: string | null;
  createdAt: string;
  defaultPlaylistId: number | null;
  playlists: Playlist[];
};

export default function ChannelDetailPage() {
  const params = useParams();

  const id = params.id as string;

  const [channel, setChannel] = useState<Channel | null>(null);

  const [selectedPlaylist, setSelectedPlaylist] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function getChannel() {
      try {
        const res = await fetch(`/api/channels/${id}`);

        const data = await res.json();

        setChannel(data);

        setSelectedPlaylist(data.defaultPlaylistId ?? null);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      getChannel();
    }
  }, [id]);

  async function saveChanges() {
    try {
      setSaving(true);

      await fetch(`/api/channels/${id}`, {
        method: "PATCH",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          defaultPlaylistId: selectedPlaylist,
        }),
      });

      alert("Fallback playlist updated");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="text-white">Loading...</div>;
  }

  if (!channel) {
    return <div className="text-red-500">Channel not found</div>;
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}

      <div>
        <h1 className="text-3xl font-bold">Channel Details</h1>

        <p className="mt-1 text-gray-400">Manage channel configuration</p>
      </div>

      {/* Basic */}

      <div className="rounded-2xl border border-white/10 bg-[#0B1026] p-6">
        <h2 className="mb-5 text-lg font-semibold">Basic Information</h2>

        <div className="space-y-4">
          <div className="flex justify-between">
            <span className="text-gray-400">Channel Name</span>

            <span>{channel.name}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-400">Country</span>

            <span>{channel.country ?? "-"}</span>
          </div>

          <div>
            <p className="text-gray-400">Description</p>

            <p>{channel.description ?? "No description"}</p>
          </div>
        </div>
      </div>

      {/* Stream */}

      <div className="rounded-2xl border border-white/10 bg-[#0B1026] p-6">
        <h2 className="mb-5 text-lg font-semibold">Broadcast Configuration</h2>

        <div className="flex items-center justify-between">
          <span className="text-gray-400">Stream Key</span>

          <code className="rounded-lg bg-black/40 px-4 py-2 font-mono text-blue-400">
            {channel.streamKey}
          </code>
        </div>
      </div>

      {/* Playlist */}

      <div className="rounded-2xl border border-white/10 bg-[#0B1026] p-6">
        <h2 className="text-lg font-semibold">24/7 Fallback Playlist</h2>

        <p className="mt-1 mb-5 text-sm text-gray-400">
          Automatically used when there is no active schedule.
        </p>

        <div className="space-y-3">
          <label className="text-sm text-gray-400">Select Playlist</label>

          <select
            value={selectedPlaylist ?? ""}

            onChange={(e) =>
              setSelectedPlaylist(
                e.target.value ? Number(e.target.value) : null,
              )
            }

            className="w-full rounded-xl border border-white/10 bg-[#111936] px-4 py-3 text-white transition outline-none focus:border-blue-500"
          >
            <option value="">No fallback playlist</option>

            {channel.playlists.map((playlist) => (
              <option
                key={playlist.id}

                value={playlist.id}
              >
                {playlist.name}

                {playlist.totalDuration
                  ? ` • ${Math.floor(playlist.totalDuration / 60)} min`
                  : ""}
              </option>
            ))}
          </select>

          {selectedPlaylist && (
            <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 px-4 py-3 text-sm text-blue-300">
              Selected:{" "}
              {channel.playlists.find((p) => p.id === selectedPlaylist)?.name}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}

      <div className="flex justify-end">
        <button
          onClick={saveChanges}

          disabled={saving}

          className="rounded-xl bg-blue-600 px-6 py-3 font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
