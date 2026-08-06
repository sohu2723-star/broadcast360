"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";

type Channel = {
  id: number;
  name: string;
  logo: string | null;
  description: string | null;
  country: string | null;
};

interface PaginationData {
  page: number;
  limit: number;
  total: number;
}

export default function ChannelsPage() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 5,
    total: 0,
  });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // FETCH PAGINATED CHANNELS
  const loadChannels = useCallback(async (page: number, query: string) => {
    setLoading(true);
    try {
      const searchParam = query ? `&search=${encodeURIComponent(query)}` : "";
      const res = await fetch(
        `/api/channels?page=${page}&limit=5${searchParam}`,
      );
      const result = await res.json();

      if (result.data) {
        setChannels(result.data);
        setPagination(result.pagination);
      }
    } catch (error) {
      console.log(error);
    } 
    finally {
      setLoading(false);
    }
  }, []);

  // Sync state with current page and fetch data
  useEffect(() => {
    let cancelled = false;

    const fetchChannels = async () => {
      try {
        await loadChannels(pagination.page, search);
      } catch (error) {
        console.error(error);
      }
    };

    void fetchChannels();

    return () => {
      cancelled = true;
    };
  }, [loadChannels, pagination.page, search]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleDelete = async (id: number) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this channel?",
    );
    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/channels/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete channel");

      setChannels((prev) => prev.filter((channel) => channel.id !== id));
      alert("Channel deleted successfully");
      loadChannels(pagination.page, search);
    } catch (error) {
      console.error(error);
      alert("Delete failed");
    }
  };

  const totalPages = Math.ceil(pagination.total / pagination.limit);

  return (
    <div className="p-4 sm:p-6 min-h-screen bg-[#010312] text-white">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        {/* Search Input */}
        <div className="max-w-md w-full relative">
          <input
            type="text"
            placeholder="Search channels by name or country..."
            value={search}
            onChange={handleSearchChange}
            className="w-full bg-[#0B1026] text-white border border-white/10 rounded-xl px-4 py-2.5 placeholder-gray-500 focus:outline-none focus:border-[#106EE9] focus:ring-1 focus:ring-[#106EE9] transition text-sm shadow-sm"
          />
        </div>

        {/* Add Button */}
        <Link
          href="/admin/channels/create"
          className="w-full sm:w-auto bg-[#106EE9] hover:bg-[#0e5bc2] text-white px-5 py-2.5 rounded-xl font-medium text-sm text-center whitespace-nowrap transition shadow-lg shadow-[#106EE9]/20"
        >
          + Add Channel
        </Link>
      </div>

      {/* Main Data Table Card */}
      <div className="bg-[#0B1026] rounded-2xl border border-white/10 overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-zinc-400 text-sm font-mono animate-pulse">
            Loading channels...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-xs font-semibold uppercase tracking-wider text-zinc-400 bg-white/[0.02]">
                  <th className="p-4 pl-6 w-20">Logo</th>
                  <th className="p-4">Name</th>
                  <th className="p-4">Country</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/5 text-sm">
                {channels.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="p-12 text-center text-zinc-500 text-sm"
                    >
                      No channels found matching your search criteria.
                    </td>
                  </tr>
                ) : (
                  channels.map((channel) => (
                    <tr
                      key={channel.id}
                      className="hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="p-4 pl-6">
                        {channel.logo ? (
                          <Image
                            src={channel.logo}
                            alt={channel.name}
                            width={44}
                            height={44}
                            className="w-11 h-11 object-cover rounded-xl bg-white/5 border border-white/10 shadow-sm"
                          />
                        ) : (
                          <div className="w-11 h-11 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-[10px] text-zinc-500 font-mono text-center p-1">
                            No Logo
                          </div>
                        )}
                      </td>
                      <td className="p-4 font-semibold text-white">
                        {channel.name}
                      </td>
                      <td className="p-4 text-zinc-400 font-mono text-xs">
                        {channel.country ?? "—"}
                      </td>

                      <td className="p-4 pr-6">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/channels/${channel.id}`}
                            className="bg-[#106EE9]/10 hover:bg-[#106EE9]/20 text-[#106EE9] border border-[#106EE9]/30 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition"
                          >
                            Details
                          </Link>
                          <Link
                            href={`/admin/channels/edit/${channel.id}`}
                            className="bg-[#400FD3]/10 hover:bg-[#400FD3]/20 text-[#8B5CF6] border border-[#400FD3]/30 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(channel.id)}
                            className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination UI Controls */}
        {!loading && totalPages > 1 && (
          <div className="p-4 px-6 flex justify-between items-center border-t border-white/10 text-xs text-zinc-400 bg-white/[0.01]">
            <div>
              Page{" "}
              <span className="text-white font-medium">{pagination.page}</span>{" "}
              of <span className="text-white font-medium">{totalPages}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() =>
                  setPagination((prev) => ({
                    ...prev,
                    page: Math.max(1, prev.page - 1),
                  }))
                }
                disabled={pagination.page === 1}
                className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 text-white rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition text-xs border border-white/5"
              >
                Previous
              </button>
              <button
                onClick={() =>
                  setPagination((prev) => ({
                    ...prev,
                    page: Math.min(totalPages, prev.page + 1),
                  }))
                }
                disabled={pagination.page === totalPages}
                className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 text-white rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition text-xs border border-white/5"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}