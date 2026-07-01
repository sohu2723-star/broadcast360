"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";

interface Program {
  id: number;
  title: string;
  type: string;
  description: string;
  channel: string;
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
    <div className="p-6 text-white space-y-6">
      
      {/*Top Header */}
      <div className="flex justify-between items-center w-full">
        <h1 className="text-2xl font-bold tracking-tight">Broadcast360 Program Portal</h1>
        <button
          onClick={() => router.push("/admin/programs/create")}
          className="bg-[#106EE9] px-5 py-2.5 rounded-xl font-semibold text-sm hover:opacity-90 transition-all"
        >
          + Create Program
        </button>
      </div>

      <div className="w-full">
        <div className="flex flex-row gap-4 items-center w-full">
          
          {/*Search by Title Text Box */}
          <div className="flex-1 min-w-0">
            <input
              type="text"
              placeholder="Search by title..."
              className="w-full bg-[#070B1E] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#106EE9] text-slate-300 placeholder-slate-500"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>
          
          {/*  Program Type Dropdown */}
          <div className="flex-1 min-w-0">
            <select
              className="w-full bg-[#070B1E] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#106EE9] text-slate-300"
              value={selectedType}
              onChange={(e) => handleTypeChange(e.target.value)}
            >
              <option value="">All Program Types</option>
              {dynamicTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/*Channel Dropdown */}
          <div className="flex-1 min-w-0">
            <select
              className="w-full bg-[#070B1E] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#106EE9] text-slate-300"
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
      </div>

      {/* Datagrid Table Layer */}
      <div className="bg-[#070B1E] border border-white/10 rounded-2xl shadow-2xl w-full overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400 animate-pulse text-sm">Loading workspace matrix...</div>
        ) : programs.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">No programs matching the specified criteria inside storage.</div>
        ) : (
          <table className="w-full border-collapse text-sm table-fixed">
            <thead>
              <tr className="border-b border-white/10 bg-white/5 text-slate-400 font-medium text-center">
                <th className="p-4 w-[12%] text-center">Channel</th>
                <th className="p-4 w-[20%] text-center">Title</th>
                <th className="p-4 w-[13%] text-center">Type</th>
                <th className="p-4 w-[25%] text-center">Description</th>
                <th className="p-4 w-[15%] text-center">Created Date</th>
                <th className="p-4 w-[15%] text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {programs.map((program) => (
                <tr key={program.id} className="hover:bg-white/[0.02] transition-colors duration-150 text-center">
                  <td className="p-4 align-middle font-semibold text-[#106EE9] truncate text-center">{program.channel}</td>
                  <td className="p-4 align-middle font-medium text-white truncate text-center">{program.title}</td>
                  <td className="p-4 align-middle text-center">
                    <span className="inline-block px-2 py-0.5 rounded text-xs font-mono bg-white/10 text-slate-300">
                      {program.type}
                    </span>
                  </td>
                  <td className="p-4 align-middle text-slate-400 truncate text-center">{program.description || "-"}</td>
                  <td className="p-4 align-middle text-slate-400 font-mono text-xs truncate text-center">{program.createdAt}</td>
                
                  <td className="p-4 align-middle text-center space-x-3 whitespace-nowrap">
                    <button
                      onClick={() => router.push(`/admin/programs/${program.id}`)}
                      className="text-slate-300 hover:text-white hover:underline text-xs font-semibold inline-block"
                    >
                      Details
                    </button>
                    <button
                      onClick={() => router.push(`/admin/programs/edit/${program.id}`)}
                      className="text-[#106EE9] hover:underline text-xs font-semibold inline-block"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(program.id)}
                      disabled={isPending}
                      className="text-[#F41010] hover:underline text-xs font-semibold inline-block disabled:opacity-40"
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

      {/*PAGINATION UI CONTROLS */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between bg-[#070B1E] border border-white/10 p-4 rounded-xl shadow-md text-sm text-slate-400">
          <div>
            Showing <span className="text-white font-medium">{programs.length}</span> of{" "}
            <span className="text-white font-medium">{pagination.totalCount}</span> programs
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={!pagination.hasPrevPage}
              className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              Previous
            </button>

            {Array.from({ length: pagination.totalPages }, (_, index) => {
              const pageNum = index + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition ${
                    page === pageNum
                      ? "bg-[#106EE9] border-[#106EE9] text-white"
                      : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={!pagination.hasNextPage}
              className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              Next
            </button>
          </div>
        </div>
      )}

    </div>
  );
}