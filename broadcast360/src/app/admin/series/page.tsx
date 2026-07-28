"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import Pagination from "@/components/admin/Pagination";

type SeriesItem = {
  id: number;
  title: string;
  genre: string | null;
  thumbnail: string | null;
  episodeCount: number;
  partCount: number;
  createdAt: string;
};

interface PaginationData {
  page: number;
  limit: number;
  total: number;
}

export default function SeriesPage() {
  const [loading, setLoading] = useState(false);
  const [seriesList, setSeriesList] = useState<SeriesItem[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 10,
    total: 0,
  });
  const [search, setSearch] = useState("");

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // FETCH PAGINATED SERIES
  const loadSeries = useCallback(
    async (page: number, query: string) => {
      setLoading(true);
      try {
        const searchParam = query ? `&search=${encodeURIComponent(query)}` : "";
        const res = await fetch(
          `/api/series?page=${page}&limit=${pagination.limit}${searchParam}`,
        );
        const result = await res.json();

        if (result.data) {
          setSeriesList(result.data);
          setPagination((prev) => ({
            ...prev,
            page: page,
            total: result.total ?? result.pagination?.total ?? 0,
          }));
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    },
    [pagination.limit],
  );

  useEffect(() => {
    let cancelled = false;

    const fetchSeries = async () => {
      try {
        if (!cancelled) {
          await loadSeries(pagination.page, search);
        }
      } catch (error) {
        console.error(error);
      }
    };

    void fetchSeries();

    return () => {
      cancelled = true;
    };
  }, [loadSeries, pagination.page, search]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    setSearch(value);
    setPagination((prev) => ({
      ...prev,
      page: 1,
    }));
  };

  const handleDelete = async (id: number) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this series and all its episodes?",
    );
    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/series/${id}`, {
        method: "DELETE",
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Failed to delete from server");
      }

      setSeriesList((prev) => prev.filter((item) => item.id !== id));
      alert("Series deleted successfully!");

      loadSeries(pagination.page, search);
    } catch (error) {
      console.error("Delete UI Error:", error);
      alert("Delete failed. Please try again.");
    }
  };

  const totalPages = Math.ceil(pagination.total / pagination.limit) || 1;

  return (
    <div>
      {/* Header Section */}
      <div className="mb-8 flex items-center justify-between gap-4">
        <div className="w-full max-w-md">
          <input
            type="text"
            placeholder="Search series by title or genre..."
            value={search}
            onChange={handleSearchChange}
            className="w-full rounded-xl border border-white/10 bg-[#0B1026] px-4 py-3 text-sm text-white placeholder-gray-500 transition focus:border-[#106EE9] focus:outline-none"
          />
        </div>

        <Link
          href="/admin/series/create"
          className="rounded-xl bg-[#106EE9] px-5 py-3 whitespace-nowrap text-white transition hover:opacity-90"
        >
          + Add Series
        </Link>
      </div>

      {/* Main Data Table */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0B1026]">
        {loading ? (
          <div className="p-10 text-center text-white">
            Loading series list...
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 text-gray-400">
                <th className="w-20 p-5 text-left">Cover</th>
                <th className="p-5 text-left">Series Title</th>
                <th className="p-5 text-left">Genre</th>
                <th className="p-5 text-left">Episode Count</th>
                <th className="p-5 text-left">Created Date</th>
                <th className="p-5 text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {seriesList.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="p-14 text-center text-sm text-gray-500"
                  >
                    No series found matching your search criteria.
                  </td>
                </tr>
              ) : (
                seriesList.map((series) => (
                  <tr
                    key={series.id}
                    className="border-b border-white/10 hover:bg-white/[0.03]"
                  >
                    {/* Thumbnail Column */}
                    <td className="p-5">
                      {series.thumbnail ? (
                        <div className="relative h-16 w-12 overflow-hidden rounded-lg border border-white/10 bg-gray-900 shadow-md">
                          <Image
                            src={series.thumbnail}
                            alt={series.title}
                            width={48}
                            height={64}
                            className="block h-full w-full object-cover"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = "none";
                              if (target.parentElement) {
                                target.parentElement.innerHTML =
                                  '<div class="w-full h-full flex items-center justify-center text-[10px] text-gray-500">Error</div>';
                              }
                            }}
                          />
                        </div>
                      ) : (
                        <div className="flex h-16 w-12 items-center justify-center rounded-lg border border-white/10 bg-white/5 p-1 text-center text-[10px] text-gray-500">
                          No Pic
                        </div>
                      )}
                    </td>

                    {/* Series Title */}
                    <td className="p-5 font-medium text-white">
                      {series.title}
                    </td>

                    {/* Genre */}
                    <td className="p-5 text-gray-300">{series.genre ?? "-"}</td>

                    {/* Episode & Part Count Badge */}
                    <td className="p-5">
                      <span className="rounded-full border border-[#106EE9]/20 bg-white/5 px-3 py-1 text-xs font-semibold text-[#106EE9]">
                        {series.episodeCount} Ep
                        {series.episodeCount > 1 ? "s" : ""}{" "}
                        <span className="text-gray-400">
                          ({series.partCount ?? 0} Part
                          {(series.partCount ?? 0) > 1 ? "s" : ""})
                        </span>
                      </span>
                    </td>

                    {/* Created Date */}
                    <td className="p-8 text-sm text-gray-400">
                      {formatDate(series.createdAt)}
                    </td>

                    {/* Action Buttons */}
                    <td className="p-5">
                      <div className="flex justify-center gap-3">
                        <Link
                          href={`/admin/series/${series.id}`}
                          className="rounded-lg bg-[#106EE9] px-4 py-2 text-sm text-white transition hover:opacity-80"
                        >
                          Details
                        </Link>
                        <Link
                          href={`/admin/series/edit/${series.id}`}
                          className="rounded-lg bg-[#400FD3] px-4 py-2 text-sm text-white transition hover:opacity-80"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(series.id)}
                          className="rounded-lg bg-[#F41010] px-4 py-2 text-sm text-white transition hover:opacity-80"
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
        )}
      </div>

      {/* Pagination UI Control */}
      <Pagination
        page={pagination.page}
        totalPages={totalPages}
        setPage={(newPage) => {
          const nextPg =
            typeof newPage === "function" ? newPage(pagination.page) : newPage;
          setPagination((prev) => ({ ...prev, page: nextPg }));
        }}
        loading={loading}
      />
    </div>
  );
}
