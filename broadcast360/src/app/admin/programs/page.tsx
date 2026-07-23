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
    <div className="min-h-screen space-y-6 bg-[#010312] p-3 text-white">
      {/* HEADER */}
      <div className="mb-2 flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="rounded-xl border border-white/10 bg-[#0B1026] px-5 py-2.5 text-sm transition hover:border-[#106EE9]"
        >
          ← Back
        </button>

        <button
          onClick={() => router.push("/admin/programs/create")}
          className="rounded-xl bg-[#106EE9] px-5 py-2.5 text-sm font-semibold transition hover:bg-[#400FD3]"
        >
          + Create Program
        </button>
      </div>

      {/* FILTER CARD */}
      <div className="rounded-2xl border border-white/10 bg-[#0B1026] p-2">
        <div className="grid grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Search programs..."
            className="w-full rounded-xl border border-white/10 bg-[#010312] px-4 py-3 text-sm focus:border-[#106EE9] focus:outline-none"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
          />

          <select
            className="w-full rounded-xl border border-white/10 bg-[#010312] px-4 py-3 text-sm focus:border-[#106EE9]"
            value={selectedType}
            onChange={(e) => handleTypeChange(e.target.value)}
          >
            <option value="">All Types</option>
            {dynamicTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          <select
            className="w-full rounded-xl border border-white/10 bg-[#010312] px-4 py-3 text-sm focus:border-[#106EE9]"
            value={selectedChannel}
            onChange={(e) => handleChannelChange(e.target.value)}
          >
            <option value="">All Channels</option>
            {dynamicChannels.map((channel) => (
              <option key={channel} value={channel}>
                {channel}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* TABLE CARD */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0B1026]">
        {loading ? (
          <div className="p-10 text-center text-white/60">
            Loading programs...
          </div>
        ) : programs.length === 0 ? (
          <div className="p-10 text-center text-white/60">
            No programs found
          </div>
        ) : (
          <table className="w-full">
            <thead className="border-b border-white/10 bg-[#010312]">
              <tr className="text-left text-white/80">
                <th className="p-5">Channel</th>
                <th className="p-5">Title</th>
                <th className="p-5">Type</th>
                <th className="p-5">Created</th>
                <th className="p-5 text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {programs.map((program) => (
                <tr
                  key={program.id}
                  className="group border-b border-white/5 transition-all duration-200 hover:bg-white/[0.04] hover:shadow-lg"
                >
                  {/* Channel */}
                  <td className="px-6 py-5">
                    <div className="font-semibold text-white">
                      {program.channel && typeof program.channel === "object"
                        ? (program.channel as any).name
                        : program.channel || "Unassigned"}
                    </div>
                  </td>

                  {/* Title */}
                  <td className="px-6 py-5">
                    <div className="font-medium text-gray-200">
                      {program.title}
                    </div>
                  </td>

                  {/* Type */}
                  <td className="px-6 py-5">
                    <span className="inline-flex items-center rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-semibold tracking-wider text-blue-300 uppercase">
                      {program.type}
                    </span>
                  </td>

                  {/* Created */}
                  <td className="px-6 py-5 text-gray-300">
                    {program.createdAt
                      ? new Date(program.createdAt).toLocaleDateString()
                      : "-"}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-5">
                    <div className="flex justify-center gap-2">
                      <a
                        href={`/admin/programs/${program.id}`}
                        className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:scale-105 hover:bg-sky-500"
                      >
                        View
                      </a>

                      <a
                        href={`/admin/programs/edit/${program.id}`}
                        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:scale-105 hover:bg-indigo-500"
                      >
                        Edit
                      </a>

                      <button
                        onClick={() => handleDelete(program.id)}
                        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:scale-105 hover:bg-red-500"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* PAGINATION */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-2 text-sm text-white/60">
          <div>
            Showing {programs.length} of {pagination.totalCount} entries
          </div>

          <div className="flex gap-2">
            <button
              disabled={!pagination.hasPrevPage}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded border border-white/10 bg-[#0B1026] px-3 py-1 disabled:opacity-40"
            >
              Prev
            </button>

            <button
              disabled={!pagination.hasNextPage}
              onClick={() =>
                setPage((p) => Math.min(pagination.totalPages, p + 1))
              }
              className="rounded border border-white/10 bg-[#0B1026] px-3 py-1 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
