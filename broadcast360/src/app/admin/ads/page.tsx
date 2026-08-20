"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Pagination from "@/components/admin/Pagination";
import AdminConfirmDialog from "@/components/admin/ui/AdminConfirmDialog";

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
  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return [hrs, mins, secs].map((v) => String(v).padStart(2, "0")).join(":");
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<Advertisement | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState("");

  const loadAdvertisements = useCallback(
    async (pageNumber: number, query: string, status: string) => {
      try {
        setLoading(true);

        const params = new URLSearchParams({
          page: String(pageNumber),
          limit: "5",
          status: status,
        });

        if (query.trim()) {
          params.append("search", query.trim());
        }

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
    },
    [],
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      loadAdvertisements(page, search, statusFilter);
    }, 400);

    return () => clearTimeout(timer);
  }, [page, search, statusFilter, loadAdvertisements]);

  // DELETE
  const handleDelete = async () => {
    if (!deleteTarget) return;

    setDeleteLoading(true);
    setActionMessage("");
    try {
      const res = await fetch(`/api/ads/${deleteTarget.id}`, { method: "DELETE" });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(result.message || "Delete failed");
      setDeleteTarget(null);
      setActionMessage("Advertisement deleted successfully.");
      await loadAdvertisements(page, search, statusFilter);
    } catch (error) {
      console.error(error);
      setActionMessage(error instanceof Error ? error.message : "Delete failed");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="p-6">
      {actionMessage && (
        <div className="mb-4 rounded-xl border border-white/10 bg-[#0B1026] px-4 py-3 text-sm text-slate-200">
          {actionMessage}
        </div>
      )}

      {/* SEARCH + FILTER */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex gap-4">
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search title..."
            className="w-96 rounded-xl border border-white/10 bg-[#0B1026] px-4 py-3 text-white outline-none focus:border-[#4f6689]"
          />

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-white/10 bg-[#0B1026] px-4 py-2 text-white outline-none focus:border-[#4f6689]"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <Link
          href="/admin/ads/create"
          className="rounded-xl bg-[#4f6689] px-5 py-3 text-white transition-all hover:opacity-90"
        >
          + Create New Ads
        </Link>
      </div>

      {/* TABLE */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0B1026]">
        {loading ? (
          <div className="p-10 text-center text-white">
            Loading advertisements...
          </div>
        ) : (
          <table className="w-full text-white">
            <thead>
              <tr className="border-b border-white/10 bg-[#0f1636] text-gray-400">
                <th className="p-5 text-left">Thumbnail</th>
                <th className="p-5 text-left">Title</th>
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
                  className="border-b border-white/10 transition-all hover:bg-white/5"
                >
                  {/* THUMBNAIL */}
                  <td className="p-5">
                    <Image
                      src={
                        ad.thumbnailUrl ||
                        ad.videoUrl ||
                        "/fallback-thumbnail.png"
                      }
                      width={128}
                      height={80}
                      className="h-20 w-32 rounded-lg border border-white/5 bg-black object-cover"
                      alt={ad.title}
                      unoptimized={
                        ad.videoUrl?.startsWith("http") ? true : false
                      }
                    />
                  </td>
                  <td className="p-5 font-medium">{ad.title}</td>

                  <td className="p-5">
                    {ad.duration !== undefined && ad.duration !== null
                      ? formatDuration(Number(ad.duration))
                      : "-"}
                  </td>

                  <td className="p-5">
                    <span
                      className={`rounded px-2 py-1 text-xs font-semibold ${
                        ad.active
                          ? "bg-green-500/20 text-green-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {ad.active ? "Active" : "Inactive"}
                    </span>
                  </td>

                  <td className="p-5 text-gray-400">
                    {formatDate(ad.createdAt)}
                  </td>

                  <td className="p-5">
                    <div className="flex gap-3">
                      <Link
                        href={`/admin/ads/${ad.id}`}
                        className="rounded-lg bg-[#4f6689] px-4 py-2 text-center text-sm font-semibold transition-all hover:opacity-90"
                      >
                        View
                      </Link>

                      <Link
                        href={`/admin/ads/edit/${ad.id}`}
                        className="rounded-lg bg-[#400FD3] px-4 py-2 text-center text-sm font-semibold transition-all hover:opacity-90"
                      >
                        Edit
                      </Link>

                      <button
                        type="button"
                        onClick={() => setDeleteTarget(ad)}
                        className="cursor-pointer rounded-lg bg-[#F41010] px-4 py-2 text-sm font-semibold text-white transition-all hover:opacity-90"
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
        )}
      </div>

      {/* REUSABLE PAGINATION */}
      <Pagination
        page={page}
        totalPages={totalPages}
        setPage={(newPage) => {
          const nextPg =
            typeof newPage === "function" ? newPage(page) : newPage;
          setPage(nextPg);
        }}
        loading={loading}
      />

      <AdminConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete advertisement?"
        description={deleteTarget ? `“${deleteTarget.title}” will be permanently removed.` : "This action cannot be undone."}
        confirmLabel="Delete advertisement"
        destructive
        loading={deleteLoading}
        onCancel={() => {
          if (!deleteLoading) setDeleteTarget(null);
        }}
        onConfirm={handleDelete}
      />
    </div>
  );
}
