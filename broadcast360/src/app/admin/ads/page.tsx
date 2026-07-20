"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Image from "next/image";

type Advertisement = {
  id: number;
  title: string;
  videoUrl: string;
  thumbnailUrl?: string;
  duration: number;
  active: boolean;
  createdAt: string;
};

export default function AdvertisementsPage() {
  const formatDuration = (sec: any) => {
    const totalSeconds = Math.floor(Number(sec));
    
    if (isNaN(totalSeconds) || totalSeconds < 0) {
      return "00:00";
    }
    const hours = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`;
    }

    return `${mins}:${seconds.toString().padStart(2, "0")}`;
  };

  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // FETCH DATA
  const loadAdvertisements = async (pageNumber = 1) => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      params.set("page", pageNumber.toString());
      params.set("limit", "5");
      params.set("search", search.trim());
      params.set("status", statusFilter);

      const res = await fetch(`/api/ads?${params.toString()}`);
      const result = await res.json();
      setAdvertisements(result?.data || []);
      setTotalPages(result?.pagination?.totalPages || 1);
    } catch (error) {
      console.error(error);
      setAdvertisements([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  // pagination load
  useEffect(() => {
    loadAdvertisements(page);
  }, [page]);

  // search + filter
  useEffect(() => {
    setPage(1);
    loadAdvertisements(1);
  }, [search, statusFilter]);

  // delete
  const handleDelete = async (id: number) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this advertisement?"
    );

    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/ads/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Delete failed");

      alert("Advertisement deleted");
      loadAdvertisements(page);
    } catch (error) {
      console.error(error);
      alert("Delete failed");
    }
  };

  if (loading) {
    return <div className="text-white p-6 text-center">Loading advertisements...</div>;
  }

  return (
    <div className="p-6">
      {/* SEARCH + FILTER */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Search by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-[#0B1026] border border-white/10 rounded-xl px-4 py-2 w-80 text-white"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#0B1026] border border-white/10 rounded-xl px-4 py-2 text-white"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <Link
          href="/admin/ads/create"
          className="bg-[#106EE9] text-white px-5 py-3 rounded-xl hover:opacity-90 transition-all"
        >
          + Create New Ads
        </Link>
      </div>

      {/* TABLE */}
      <div className="bg-[#0B1026] rounded-2xl border border-white/10 overflow-hidden">
        <table className="w-full text-white">
          <thead>
            <tr className="border-b border-white/10 text-gray-400 bg-[#0f1636]">
              <th className="p-5 text-left">Title</th>
              <th className="p-5 text-left">Thumbnail</th>
              <th className="p-5 text-left">Duration</th>
              <th className="p-5 text-left">Status</th>
              <th className="p-5 text-left">Created Date</th>
              <th className="p-5 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {(advertisements || []).map((ad) => (
              <tr key={ad.id} className="border-b border-white/10 hover:bg-white/5 transition-all">
                <td className="p-5 font-medium">{ad.title}</td>

                {/* THUMBNAIL */}
                <td className="p-5">
                  <Image
                    src={ad.thumbnailUrl || ad.videoUrl || "/fallback-thumbnail.png"}
                    width={128}
                    height={80}
                    className="w-32 h-20 rounded-lg object-cover bg-black border border-white/5"
                    alt={ad.title}
                    unoptimized={ad.videoUrl?.startsWith("http") ? true : false} 
                  />
                </td>
               
                <td className="p-5">
                  {ad.duration !== undefined && ad.duration !== null ? formatDuration(Number(ad.duration)) : "-"}
                </td>

                <td className="p-5">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${ad.active ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                    {ad.active ? "Active" : "Inactive"}
                  </span>
                </td>

                <td className="p-5 text-gray-400">
                  {new Date(ad.createdAt).toLocaleDateString()}
                </td>

                <td className="p-5">
                  <div className="flex gap-3">
                    <Link
                      href={`/admin/ads/${ad.id}`}
                      className="bg-[#106EE9] px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-all text-center"
                    >
                      View
                    </Link>

                    <Link
                      href={`/admin/ads/edit/${ad.id}`}
                      className="bg-[#400FD3] px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-all text-center"
                    >
                      Edit
                    </Link>

                    <button
                      onClick={() => handleDelete(ad.id)}
                      className="bg-[#F41010] px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-all text-white cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {advertisements.length === 0 && (
              <tr>
                <td colSpan={6} className="p-10 text-center text-gray-400">
                  No advertisements found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="flex gap-3 mt-6 justify-center items-center">
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className="px-4 py-2 bg-[#106EE9] rounded-lg disabled:opacity-50 text-white font-medium text-sm"
        >
          Prev
        </button>

        <span className="px-4 py-2 text-white text-sm">
          Page {page} of {totalPages}
        </span>

        <button
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
          className="px-4 py-2 bg-[#106EE9] rounded-lg disabled:opacity-50 text-white font-medium text-sm"
        >
          Next
        </button>
      </div>
    </div>
  );
}