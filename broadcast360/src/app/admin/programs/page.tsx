"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";

interface Program {
  id: number;
  title: string;
  type: string;
  description: string;
  // Adjusted type definition to match what your prisma service returns safely
  channel: string | { id: number; name: string } | null;
  createdAt: string;
}

interface PaginationMeta {
  currentPage: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export default function ProgramsPage() {
  const router = useRouter();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Dynamic Options States
  const [dynamicTypes, setDynamicTypes] = useState<string[]>([]);
  const [dynamicChannels, setDynamicChannels] = useState<string[]>([]);

  // Filter & Search Value States
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedChannel, setSelectedChannel] = useState("");

  // Pagination States
  const [page, setPage] = useState(1);
  const [limit] = useState(10); 
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);

  const fetchWorkspaceData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (search.trim()) params.append("search", search);
      if (selectedType) params.append("type", selectedType);
      if (selectedChannel) params.append("channel", selectedChannel);
      
      params.append("page", page.toString());
      params.append("limit", limit.toString());

      const res = await fetch(`/api/programs?${params.toString()}`);
      if (res.ok) {
        const result = await res.json();
        setPrograms(result.data || []);
        
        if (result.meta) {
          setDynamicTypes(result.meta.programTypes || []);
          setDynamicChannels(result.meta.channels || []);
          setPagination(result.meta.pagination || null);
        }
      }
    } catch (error) {
      console.error("Failed to fetch programs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaceData();
  }, [search, selectedType, selectedChannel, page]);

  const handleSearchChange = (value: string) => {
    setPage(1);
    setSearch(value);
  };

  const handleTypeChange = (value: string) => {
    setPage(1);
    setSelectedType(value);
  };

  const handleChannelChange = (value: string) => {
    setPage(1);
    setSelectedChannel(value);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this program?")) return;

    startTransition(async () => {
      try {
        const res = await fetch(`/api/programs/${id}`, { method: "DELETE" });
        if (res.ok) {
          setPrograms((prev) => prev.filter((p) => p.id !== id));
          await fetchWorkspaceData();
          router.refresh();
        }
      } catch (error) {
        console.error("Delete error:", error);
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#010312] text-white p-3 space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-2">
        <button
          onClick={() => router.back()}
          className="px-5 py-2.5 rounded-xl bg-[#0B1026] border border-white/10 hover:border-[#106EE9] transition text-sm"
        >
          ← Back
        </button>

        <button
          onClick={() => router.push("/admin/programs/create")}
          className="px-5 py-2.5 rounded-xl bg-[#106EE9] hover:bg-[#400FD3] transition text-sm font-semibold"
        >
          + Create Program
        </button>
      </div>

      {/* FILTER CARD */}
      <div className="bg-[#0B1026] border border-white/10 rounded-2xl p-2">
        <div className="grid grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Search programs..."
            className="w-full bg-[#010312] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#106EE9]"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
          />

          <select
            className="w-full bg-[#010312] border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[#106EE9]"
            value={selectedType}
            onChange={(e) => handleTypeChange(e.target.value)}
          >
            <option value="">All Types</option>
            {dynamicTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>

          <select
            className="w-full bg-[#010312] border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[#106EE9]"
            value={selectedChannel}
            onChange={(e) => handleChannelChange(e.target.value)}
          >
            <option value="">All Channels</option>
            {dynamicChannels.map((channel) => (
              <option key={channel} value={channel}>{channel}</option>
            ))}
          </select>
        </div>
      </div>

      {/* TABLE CARD */}
      <div className="bg-[#0B1026] border border-white/10 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-white/60">
            Loading programs...
          </div>
        ) : programs.length === 0 ? (
          <div className="p-10 text-center text-white/60">
            No programs found
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-[#010312] border-b border-white/10">
              <tr className="text-left text-white/60">
                <th className="p-4">Channel</th>
                <th>Title</th>
                <th>Type</th>
                <th>Created</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {programs.map((program) => (
                <tr
                  key={program.id}
                  className="border-b border-white/5 hover:bg-white/5 transition"
                >
                  {/* 👇 SAFE INTERCEPT FIX: Safely parse object vs string relation layouts */}
                  <td className="p-4 text-[#106EE9] font-medium">
                    {program.channel && typeof program.channel === "object"
                      ? (program.channel as any).name
                      : program.channel || "Unassigned"}
                  </td>

                  <td className="font-medium">
                    {program.title}
                  </td>

                  <td>
                    <span className="px-2 py-1 rounded bg-white/5 border border-white/10 text-xs">
                      {program.type}
                    </span>
                  </td>

                  <td className="text-white/60 text-xs">
                    {program.createdAt ? new Date(program.createdAt).toLocaleDateString() : ""}
                  </td>

                  <td className="text-center space-x-3">
                    <button
                      onClick={() => router.push(`/admin/programs/${program.id}`)}
                      className="text-white/70 hover:text-white text-xs"
                    >
                      Details
                    </button>

                    <button
                      onClick={() => router.push(`/admin/programs/edit/${program.id}`)}
                      className="text-[#106EE9] hover:text-[#400FD3] text-xs"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(program.id)}
                      className="text-[#F41010] hover:opacity-70 text-xs"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* PAGINATION */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-between items-center text-sm text-white/60 px-2">
          <div>
            Showing {programs.length} of {pagination.totalCount} entries
          </div>

          <div className="flex gap-2">
            <button
              disabled={!pagination.hasPrevPage}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1 rounded bg-[#0B1026] border border-white/10 disabled:opacity-40"
            >
              Prev
            </button>

            <button
              disabled={!pagination.hasNextPage}
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              className="px-3 py-1 rounded bg-[#0B1026] border border-white/10 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}