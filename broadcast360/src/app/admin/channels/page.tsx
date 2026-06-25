"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

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
  const [pagination, setPagination] = useState<PaginationData>({ page: 1, limit: 5, total: 0 });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // FETCH PAGINATED CHANNELS
  const loadChannels = useCallback(async (page: number, query: string) => {
    setLoading(true);
    try {
      const searchParam = query ? `&search=${encodeURIComponent(query)}` : "";
      const res = await fetch(`/api/channels?page=${page}&limit=5${searchParam}`);
      const result = await res.json();
      
      if (result.data) {
        setChannels(result.data);
        setPagination(result.pagination);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Sync state with current page and fetch data
  useEffect(() => {
    loadChannels(pagination.page, search);
  }, [loadChannels, pagination.page]);

  // Handle Search & Reset to Page 1
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    setPagination((prev) => ({ ...prev, page: 1 })); 
    loadChannels(1, value);
  };

  const handleDelete = async (id: number) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this channel?");
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
    <div>
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Channels</h1>
        <Link href="/admin/channels/create" className="bg-[#106EE9] px-5 py-3 rounded-xl">
          + Add Channel
        </Link>
      </div>

      {/* Search Input Box */}
      <div className="mb-6 max-w-md">
        <input
          type="text"
          placeholder="Search channels by name or country..."
          value={search}
          onChange={handleSearchChange}
          className="w-full bg-[#0B1026] text-white border border-white/10 rounded-xl px-4 py-3 placeholder-gray-500 focus:outline-none focus:border-[#106EE9] transition text-sm"
        />
      </div>

      {/* Main Data Table */}
      <div className="bg-[#0B1026] rounded-2xl border border-white/10 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-white">Loading channels...</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 text-gray-400">
                 <th className="p-5 text-left w-[80px]">Logo</th>
                <th className="p-5 text-left">Name</th>
                <th className="p-5 text-left">Country</th>
                <th className="p-5 text-left">Action</th>
              </tr>
            </thead>

            <tbody>
              {channels.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-14 text-center text-gray-500 text-sm">
                    No channels found matching your search criteria.
                  </td>
                </tr>
              ) : (
                channels.map((channel) => (
                  <tr key={channel.id} className="border-b border-white/10">
                    <td className="p-5">
                      {channel.logo ? (
                        <img 
                          src={channel.logo} 
                          alt={channel.name} 
                          className="w-12 h-12 object-cover rounded-xl bg-white/5 border border-white/10 shadow-md"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-[10px] text-gray-500 text-center p-1">
                          No Logo
                        </div>
                      )}
                    </td>
                    <td className="p-5 font-medium">{channel.name}</td>
                    <td className="p-5 text-gray-300">{channel.country ?? "-"}</td>

                    <td className="p-5 flex gap-3">
                      <Link href={`/admin/channels/${channel.id}`} className="bg-[#106EE9] px-4 py-2 rounded-lg text-sm">
                        Details
                      </Link>
                      <Link href={`/admin/channels/edit/${channel.id}`} className="bg-[#400FD3] px-4 py-2 rounded-lg text-sm">
                        Edit
                      </Link>
                      <button onClick={() => handleDelete(channel.id)} className="bg-[#F41010] px-4 py-2 rounded-lg text-white text-sm">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

        {/* Pagination UI Controls */}
        {!loading && totalPages > 1 && (
          <div className="p-5 flex justify-between items-center border-t border-white/10 text-sm text-gray-400">
            <div>
              Page <span className="text-white font-medium">{pagination.page}</span> of{" "}
              <span className="text-white font-medium">{totalPages}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPagination((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                disabled={pagination.page === 1}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                Previous
              </button>
              <button
                onClick={() => setPagination((prev) => ({ ...prev, page: Math.min(totalPages, prev.page + 1) }))}
                disabled={pagination.page === totalPages}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition"
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