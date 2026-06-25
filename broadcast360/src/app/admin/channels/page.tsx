"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Channel = {
  id: number;
  name: string;
  description: string | null;
  country: string | null;
};

export default function ChannelsPage() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadChannels() {
      try {
        const res = await fetch("/api/channels");
        const data = await res.json();
        setChannels(data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    }

    loadChannels();
  }, []);

  const handleDelete = async (id: number) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this channel?"
    );

    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/channels/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete channel");
      }

      setChannels((prev) =>
        prev.filter((channel) => channel.id !== id)
      );

      alert("Channel deleted successfully");
    } catch (error) {
      console.error(error);
      alert("Delete failed");
    }
  };

  if (loading) {
    return (
      <div className="text-white">
        Loading channels...
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">
          Channels
        </h1>

        <Link
          href="/admin/channels/create"
          className="bg-[#106EE9] px-5 py-3 rounded-xl"
        >
          + Add Channel
        </Link>
      </div>

      <div className="bg-[#0B1026] rounded-2xl border border-white/10 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10 text-gray-400">
              <th className="p-5 text-left">Name</th>

              <th className="p-5 text-left">Country</th>

              <th className="p-5 text-left">Action</th>
            </tr>
          </thead>

          <tbody>
            {channels.map((channel) => (
              <tr
                key={channel.id}
                className="border-b border-white/10"
              >
                <td className="p-5">{channel.name}</td>

                <td className="p-5">{channel.country ?? "-"}</td>

                <td className="p-5 flex gap-3">
                  <Link
                    href={`/admin/channels/${channel.id}`}
                    className="bg-[#106EE9] px-4 py-2 rounded-lg"
                  >
                    Details
                  </Link>

                  <Link
                    href={`/admin/channels/edit/${channel.id}`}
                    className="
                      bg-[#400FD3]
                      px-4
                      py-2
                      rounded-lg
                    "
                  >
                    Edit
                  </Link>

                  <button
                    onClick={() => handleDelete(channel.id)}
                    className="
                      bg-[#F41010]
                      px-4
                      py-2
                      rounded-lg
                      text-white
                    "
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}