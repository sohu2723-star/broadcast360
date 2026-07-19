"use client";

import { useCallback, useEffect, useState } from "react";

import Image from "next/image";
import Link from "next/link";

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

export default function EntertainmentListPage() {
  const [entertainments, setEntertainments] = useState<Entertainment[]>([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);

  const [total, setTotal] = useState(0);

  const limit = 5;

  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [selectedId, setSelectedId] = useState<number | null>(null);

  const formatDuration = (sec: number) => {
    const hours = Math.floor(sec / 3600);

    const mins = Math.floor((sec % 3600) / 60);

    const seconds = sec % 60;

    return (
      `${String(hours).padStart(2, "0")}:` +
      `${String(mins).padStart(2, "0")}:` +
      `${String(seconds).padStart(2, "0")}`
    );
  };

  const loadEntertainments = useCallback(
    async (page: number, query: string) => {
      setLoading(true);

      try {
        const params = new URLSearchParams({
          page: String(page),

          limit: String(limit),
        });

        if (query) {
          params.append("search", query);
        }

        const res = await fetch(`/api/entertainments?${params}`);

        const result = await res.json();

        setEntertainments(result.data ?? []);

        setTotal(result.pagination?.total ?? 0);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      loadEntertainments(page, search);
    }, 400);

    return () => clearTimeout(timer);
  }, [page, search, loadEntertainments]);

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

      loadEntertainments(page, search);
    } catch (error) {
      setToast({
        message: "Delete Failed!",

        type: "error",
      });
    }
  };

  const totalPages = Math.ceil(total / limit);

  const getPageNumbers = () => {
    const pages: number[] = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else if (page <= 3) {
      pages.push(1, 2, 3, 4, 5);
    } else if (page >= totalPages - 2) {
      pages.push(
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      );
    } else {
      pages.push(page - 2, page - 1, page, page + 1, page + 2);
    }

    return pages;
  };

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

            setPage(1);
          }}

          placeholder="Search entertainment..."

          className="w-96 rounded-xl border border-white/10 bg-[#0B1026] px-4 py-3 text-white outline-none"
        />

        <Link
          href="/admin/entertainments/create"

          className="rounded-xl bg-[#106EE9] px-5 py-3 font-medium text-white"
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
                  <td className="px-5 py-2">
                    {item.thumbnail ? (
                      <Image
                        src={item.thumbnail}

                        alt={item.title}

                        width={70}

                        height={85}

                        className="h-[85px] w-[70px] rounded-lg object-cover"
                      />
                    ) : (
                      <div className="flex h-[85px] w-[70px] items-center justify-center rounded-lg bg-white/5 text-xs text-gray-500">
                        No Image
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
                    {new Date(item.createdAt).toLocaleDateString()}
                  </td>

                  <td className="px-5 py-2">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/admin/entertainments/${item.id}`}

                        className="rounded-lg bg-[#106EE9] px-4 py-2 text-sm text-white"
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

      {/* PAGINATION */}

      {!loading && totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between rounded-xl border border-white/10 bg-[#0B1026] px-5 py-4">
          <div className="text-sm text-gray-400">
            Page <span className="font-semibold text-white">{page}</span> of{" "}
            <span className="font-semibold text-white">{totalPages}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={page === 1}

              onClick={() => setPage((p) => Math.max(1, p - 1))}

              className="rounded-lg bg-white/5 px-4 py-2 text-white disabled:opacity-40"
            >
              Prev
            </button>

            {getPageNumbers().map((number) => (
              <button
                key={number}

                onClick={() => setPage(number)}

                className={`h-10 w-10 rounded-lg ${
                  page === number
                    ? "bg-[#106EE9] text-white"
                    : "bg-white/5 text-gray-300"
                } `}
              >
                {number}
              </button>
            ))}

            <button
              disabled={page === totalPages}

              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}

              className="rounded-lg bg-white/5 px-4 py-2 text-white disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
