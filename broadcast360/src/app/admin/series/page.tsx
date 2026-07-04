"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";

type SeriesItem = {
  id: number;
  title: string;
  genre: string | null;
  thumbnail: string | null;
  episodeCount: number;
  createdAt: string;
};

interface PaginationData {
  page: number;
  limit: number;
  total: number;
}

export default function SeriesPage() {
  const [seriesList, setSeriesList] = useState<SeriesItem[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({ page: 1, limit: 10, total: 0 });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // FETCH PAGINATED SERIES
  const loadSeries = useCallback(async (page: number, query: string) => {
    setLoading(true);
    try {
      const searchParam = query ? `&search=${encodeURIComponent(query)}` : "";
      const res = await fetch(`/api/series?page=${page}&limit=10${searchParam}`);
      const result = await res.json();
      
      if (result.data) {
        setSeriesList(result.data);
        setPagination(result.pagination);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

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

const handleSearchChange = (
  e: React.ChangeEvent<HTMLInputElement>
) => {
  const value = e.target.value;

  setSearch(value);
  setPagination((prev) => ({
    ...prev,
    page: 1,
  }));
};

const handleDelete = async (id: number) => {
  const confirmDelete = window.confirm("Are you sure you want to delete this series and all its episodes?");
  if (!confirmDelete) return;

  try {
    const res = await fetch(`/api/series/${id}`, { 
      method: "DELETE" 
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

  const totalPages = Math.ceil(pagination.total / pagination.limit);

  return (
    <div>
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8 gap-4">

      <div className="w-full max-w-md">
        <input
          type="text"
          placeholder="Search series by title or genre..."
          value={search}
          onChange={handleSearchChange}
          className="w-full bg-[#0B1026] text-white border border-white/10 rounded-xl px-4 py-3 placeholder-gray-500 focus:outline-none focus:border-[#106EE9] transition text-sm"
        />
      </div>

      <Link
        href="/admin/series/create"
        className="bg-[#106EE9] px-5 py-3 rounded-xl whitespace-nowrap"
      >
        + Add Series
      </Link>
    </div>

      {/* Main Data Table */}
      <div className="bg-[#0B1026] rounded-2xl border border-white/10 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-white">Loading series list...</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 text-gray-400">
                <th className="p-5 text-left w-20">Cover</th>
                <th className="p-5 text-left">Series Title</th>
                <th className="p-5 text-left">Genre</th>
                <th className="p-5 text-left">Episode Count</th>
                <th className="p-5 text-left">Created Date</th>
                <th className="p-5 text-left">Actions</th>
              </tr>
            </thead>

            <tbody>
              {seriesList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-14 text-center text-gray-500 text-sm">
                    No series found matching your search criteria.
                  </td>
                </tr>
              ) : (
                seriesList.map((series) => (
                  <tr key={series.id} className="border-b border-white/10">
                    {/* Thumbnail Column */}
                    <td className="p-5">
                      {series.thumbnail ? (
                        <div className="w-12 h-16 relative overflow-hidden rounded-lg border border-white/10 bg-gray-900 shadow-md">
                          <Image
                            src={series.thumbnail} 
                            alt={series.title} 
                            width={48}
                            height={64}
                            className="w-full h-full object-cover block"
                            referrerPolicy="no-referrer" // External Image Block ဖြစ်ခြင်းမှ ကာကွယ်ရန်
                            onError={(e) => {
                              // အကယ်၍ Link သေနေရင် Default အစားထိုးစာသား ပြရန်
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              if (target.parentElement) {
                                target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center text-[10px] text-gray-500">Error</div>';
                              }
                            }}
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-16 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center text-[10px] text-gray-500 text-center p-1">
                          No Pic
                        </div>
                      )}
                    </td>

                    {/* Series Title */}
                    <td className="p-5 font-medium">{series.title}</td>
                    
                    {/* Genre */}
                    <td className="p-5 text-gray-300">{series.genre ?? "-"}</td>
                    
                    {/* Episode Count Badge */}
                    <td className="p-5">
                      <span className="bg-white/5 px-3 py-1 rounded-full text-xs font-semibold text-[#106EE9] border border-[#106EE9]/20">
                        {series.episodeCount} Ep{series.episodeCount > 1 ? 's' : ''}
                      </span>
                    </td>
                    
                    {/* Created Date */}
                    <td className="p-5 text-sm text-gray-400">
                      {new Date(series.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>

                    {/* Action Buttons */}
                    <td className="p-5">
                      <div className="flex gap-3">
                        <Link href={`/admin/series/${series.id}`} className="bg-[#106EE9] px-4 py-2 rounded-lg text-sm">
                          Details
                        </Link>
                        <Link href={`/admin/series/edit/${series.id}`} className="bg-[#400FD3] px-4 py-2 rounded-lg text-sm">
                          Edit
                        </Link>
                        <button onClick={() => handleDelete(series.id)} className="bg-[#F41010] px-4 py-2 rounded-lg text-white text-sm">
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

        {/* Pagination UI Control */}
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