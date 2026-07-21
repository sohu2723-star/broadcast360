"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import StreamTable, { Stream } from "@/components/admin/streams/StreamTable";

export default function StreamPage() {
  const [streams, setStreams] = useState<Stream[]>([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);

  const [totalPages, setTotalPages] = useState(1);

  async function fetchStreams() {
    try {
      setLoading(true);

      const res = await fetch(
        `/api/streams?page=${page}&limit=10&search=${search}`,
      );

      const json = await res.json();

      if (json.success) {
        setStreams(json.data);

        setTotalPages(json.totalPages);
      }
    } catch (error) {
      console.error("Fetch streams error", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchStreams();
  }, [page, search]);

  async function deleteStream(id: number) {
    const confirmDelete = confirm("Delete this stream?");

    if (!confirmDelete) return;

    await fetch(`/api/streams/${id}`, {
      method: "DELETE",
    });

    fetchStreams();
  }

  return (
    <div
      className="
      min-h-screen
      bg-[#010312]
      p-8
      text-white
      "
    >
      {/* TOP BAR */}

      <div
        className="
        flex
        justify-between
        items-center
        gap-4
        mb-8
        "
      >
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);

            setPage(1);
          }}
          placeholder="Search stream..."
          className="
          w-full
          max-w-md
          bg-[#0B1026]
          border
          border-gray-800
          rounded-lg
          px-4
          py-3
          text-white
          outline-none
          "
        />

        <Link
          href="/admin/streams/create"
          className="
          bg-[#106EE9]
          px-5
          py-3
          rounded-lg
          hover:opacity-80
          whitespace-nowrap
          "
        >
          + Add Stream
        </Link>
      </div>

      <StreamTable
        streams={streams}
        loading={loading}
        onDelete={deleteStream}
      />

      {/* PAGINATION */}

      <div
        className="
        flex
        justify-center
        items-center
        gap-4
        mt-8
        "
      >
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className="
          bg-[#0B1026]
          px-4
          py-2
          rounded-lg
          disabled:opacity-40
          "
        >
          Previous
        </button>

        <span
          className="
          text-gray-300
          "
        >
          Page {page} / {totalPages}
        </span>

        <button
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
          className="
          bg-[#0B1026]
          px-4
          py-2
          rounded-lg
          disabled:opacity-40
          "
        >
          Next
        </button>
      </div>
    </div>
  );
}
