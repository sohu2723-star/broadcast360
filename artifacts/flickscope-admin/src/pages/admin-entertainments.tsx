import { useCallback, useEffect, useState } from "react";

import { Link } from 'wouter';
import Pagination from "@/components/admin/Pagination";

interface Entertainment {
  id: number;
  title: string;
  description: string | null;
  category: string | null;
  thumbnail: string | null;
  videoUrl: string;
  duration: number;
  releaseYear: number | null;
  createdAt: string;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
}

export default function EntertainmentListPage() {
  const [entertainments, setEntertainments] = useState<Entertainment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 5,
    total: 0,
  });

  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

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

  const loadEntertainments = useCallback(
    async (page: number, query: string) => {
      setLoading(true);

      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: String(pagination.limit),
        });

        if (query) {
          params.append("search", query);
        }

        const res = await fetch(`/api/entertainments?${params}`);
        const result = await res.json();

        setEntertainments(result.data ?? []);

        setPagination((prev) => ({
          ...prev,
          page: page,
          total: result.pagination?.total ?? result.total ?? 0,
        }));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    },
    [pagination.limit],
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      loadEntertainments(pagination.page, search);
    }, 400);

    return () => clearTimeout(timer);
  }, [pagination.page, search, loadEntertainments]);

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => {
      setToast(null);
    }, 3000);

    return () => clearTimeout(timer);
  }, [toast]);

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/entertainments/${id}`, {
        method: "DELETE",
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Delete failed");
      }

      setToast({
        message: "Deleted Successfully!",
        type: "success",
      });

      loadEntertainments(pagination.page, search);
    } catch (error) {
      setToast({
        message: "Delete Failed!",
        type: "error",
      });
    }
  };

  const totalPages = Math.ceil(pagination.total / pagination.limit) || 1;

  return (
    <div>
      {/* TOAST */}
      {toast && (
        <div
          className={`fixed top-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-xl border px-5 py-4 shadow-xl ${
            toast.type === "success"
              ? "border-green-500/30 bg-green-900/30 text-green-400"
              : "border-red-500/30 bg-red-900/30 text-red-400"
          } `}
        >
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full font-bold ${
              toast.type === "success" ? "bg-green-500/20" : "bg-red-500/20"
            } `}
          >
            {toast.type === "success" ? "✓" : "!"}
          </div>

          <p className="text-sm font-medium">{toast.message}</p>
        </div>
      )}

      {/* DELETE MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 pt-20">
          <div className="w-[340px] rounded-xl border border-white/10 bg-zinc-900 px-5 py-4 shadow-xl">
            <h2 className="mb-4 text-base font-semibold text-white">
              Delete Entertainment?
            </h2>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedId(null);
                }}
                className="rounded-lg bg-white/10 px-4 py-2 text-sm text-gray-300 hover:bg-white/20"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  if (selectedId) {
                    handleDelete(selectedId);
                  }

                  setShowDeleteModal(false);
                  setSelectedId(null);
                }}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="mb-6 flex items-center justify-between">
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPagination((prev) => ({ ...prev, page: 1 }));
          }}
          placeholder="Search title, category..."
          className="w-96 rounded-xl border border-white/10 bg-[#0B1026] px-4 py-3 text-white outline-none focus:border-[#4f6689]"
        />

        <Link
          href="/entertainments/create"
          className="rounded-xl bg-[#4f6689] px-5 py-3 font-medium text-white"
        >
          + Add Entertainment
        </Link>
      </div>

      {/* TABLE */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0B1026]">
        {loading ? (
          <div className="p-10 text-center text-lg text-white">Loading...</div>
        ) : entertainments.length === 0 ? (
          <div className="p-10 text-center text-gray-400">
            No Entertainment Found
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 text-sm text-gray-400">
                <th className="px-5 py-4 text-left">Cover</th>
                <th className="px-5 py-4 text-left">Title</th>
                <th className="px-5 py-4 text-left">Category</th>
                <th className="px-5 py-4 text-left">Duration</th>
                <th className="px-5 py-4 text-left">Year</th>
                <th className="px-5 py-4 text-left">Created</th>
                <th className="px-5 py-4 text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {entertainments.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-white/10 hover:bg-white/[0.03]"
                >
                  <td className="p-5">
                    {item.thumbnail ? (
                      <div className="relative h-16 w-12 overflow-hidden rounded-lg border border-white/10 bg-gray-900 shadow-md">
                        <img
                          src={item.thumbnail}
                          alt={item.title}
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

                  <td className="px-5 py-2 font-semibold text-white">
                    {item.title}
                  </td>

                  <td className="px-5 py-2 text-gray-300">
                    {item.category ?? "-"}
                  </td>

                  <td className="px-5 py-2 text-gray-300">
                    {item.duration ? formatDuration(item.duration) : "-"}
                  </td>

                  <td className="px-5 py-2 text-gray-300">
                    {item.releaseYear ?? "-"}
                  </td>

                  <td className="px-5 py-2 text-gray-300">
                    {formatDate(item.createdAt)}
                  </td>

                  <td className="px-5 py-2">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/admin/entertainments/${item.id}`}
                        className="rounded-lg bg-[#4f6689] px-4 py-2 text-sm text-white"
                      >
                        View
                      </Link>

                      <Link
                        href={`/admin/entertainments/edit/${item.id}`}
                        className="rounded-lg bg-[#400FD3] px-4 py-2 text-sm text-white"
                      >
                        Edit
                      </Link>

                      <button
                        onClick={() => {
                          setSelectedId(item.id);
                          setShowDeleteModal(true);
                        }}
                        className="rounded-lg bg-[#F41010] px-4 py-2 text-sm text-white"
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
