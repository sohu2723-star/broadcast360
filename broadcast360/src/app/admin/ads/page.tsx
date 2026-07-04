"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Image from "next/image";

type Advertisement = {
  id: number;
  title: string;
  videoUrl: string;
  thumbnailUrl?: string; // ✅ IMPORTANT ADD
  duration: number;
  active: boolean;
  createdAt: string;
};

export default function AdvertisementsPage() {
  const [advertisements, setAdvertisements] = useState<
    Advertisement[]
  >([]);

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

      const res = await fetch(
        `/api/ads?${params.toString()}`
      );

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
    return (
      <div className="text-white">Loading advertisements...</div>
    );
  }

  return (
    <div>

      {/* SEARCH + FILTER */}
      <div className="flex items-center justify-between mb-6">
 
  <div className="flex gap-4">
    <input
      type="text"
      placeholder="Search by title..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="bg-[#0B1026] border border-white/10 rounded-xl px-4 py-2 w-80"
    />

    <select
      value={statusFilter}
      onChange={(e) => setStatusFilter(e.target.value)}
      className="bg-[#0B1026] border border-white/10 rounded-xl px-4 py-2"
    >
      <option value="all">All Status</option>
      <option value="active">Active</option>
      <option value="inactive">Inactive</option>
    </select>
  </div>

   <Link
    href="/admin/ads/create"
    className="bg-[#106EE9] text-white px-5 py-3 rounded-xl"
  >
    + Create New Ads
  </Link>

</div>
      {/* TABLE */}
      <div className="bg-[#0B1026] rounded-2xl border border-white/10 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10 text-gray-400">
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
              <tr
                key={ad.id}
                className="border-b border-white/10"
              >
                <td className="p-5">{ad.title}</td>

                {/* ✅ THUMBNAIL */}
                <td className="p-5">
                  <Image
                    src={
                      ad.thumbnailUrl ||
                      ad.videoUrl // fallback
                    }
                    width={128}
                    height={80}
                    className="w-32 h-20 rounded-lg object-cover bg-black"
                    alt={ad.title}
                  />
                </td>

                <td className="p-5">{ad.duration}s</td>

                <td className="p-5">
                  {ad.active ? "Active" : "Inactive"}
                </td>

                <td className="p-5">
                  {new Date(ad.createdAt).toLocaleDateString()}
                </td>

                <td className="p-5 flex gap-3">
                  <Link
                    href={`/admin/ads/${ad.id}`}
                    className="bg-[#106EE9] px-4 py-2 rounded-lg"
                  >
                    View
                  </Link>

                  <Link
                    href={`/admin/ads/edit/${ad.id}`}
                    className="bg-[#400FD3] px-4 py-2 rounded-lg"
                  >
                    Edit
                  </Link>

                  <button
                    onClick={() => handleDelete(ad.id)}
                    className="bg-[#F41010] px-4 py-2 rounded-lg text-white"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {advertisements.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="p-10 text-center text-gray-400"
                >
                  No advertisements found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="flex gap-3 mt-6 justify-center">
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className="px-4 py-2 bg-[#106EE9] rounded-lg disabled:opacity-50"
        >
          Prev
        </button>

        <span className="px-4 py-2 text-white">
          Page {page} of {totalPages}
        </span>

        <button
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
          className="px-4 py-2 bg-[#106EE9] rounded-lg disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}