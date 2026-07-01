"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import ScheduleSearch from "@/components/admin/schedules/ScheduleSearch";
import ScheduleFilter from "@/components/admin/schedules/ScheduleFilter";
import ScheduleTable from "@/components/admin/schedules/ScheduleTable";

export type Schedule = {
  id: number;
  channel: { id: number; name: string };
  playlist: { id: number; name: string };
  startTime: string;
  endTime: string | null;
};

export default function SchedulesPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    const fetchSchedules = async () => {
      setLoading(true);

      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: String(limit),
        });

        if (search) params.append("search", search);

        // ✅ SINGLE DATE FILTER
        if (date) {
          params.append("date", date);
        }

        const res = await fetch(`/api/schedules?${params.toString()}`);

        if (!res.ok) throw new Error("Failed API");

        const result = await res.json();

        setSchedules(result.data ?? []);
        setTotal(result.pagination?.total ?? 0);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  }, [page, limit, search, date]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8 gap-4">
        <div className="flex gap-3 w-full max-w-2xl">
          <ScheduleSearch
            value={search}
            onChange={(value) => {
              setSearch(value);
              setPage(1);
            }}
          />

          <ScheduleFilter
            value={date}
            onChange={(value) => {
              setDate(value);
              setPage(1);
            }}
          />
        </div>

        <Link
          href="/admin/schedules/create"
          className="bg-[#106EE9] px-5 py-3 rounded-xl"
        >
          + Add Schedule
        </Link>
      </div>

      {/* TABLE */}
      <ScheduleTable schedules={schedules} loading={loading} />

      {/* PAGINATION */}
      {/* PAGINATION */}
      {!loading && totalPages > 1 && (
        <div className="mt-6 bg-[#0B1026] border border-white/10 rounded-xl px-5 py-4 flex items-center justify-between">
          {/* Page Info */}
          <div className="text-sm text-gray-400">
            Page <span className="text-white font-semibold">{page}</span> of{" "}
            <span className="text-white font-semibold">{totalPages}</span>
          </div>

          {/* Pagination */}
          <div className="flex items-center gap-2">
            {/* Previous */}
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-lg bg-white/5 text-white hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              Previous
            </button>

            {/* Page Numbers */}
            {Array.from({ length: totalPages }, (_, index) => {
              const pageNumber = index + 1;

              return (
                <button
                  key={pageNumber}
                  onClick={() => setPage(pageNumber)}
                  className={`w-10 h-10 rounded-lg transition font-medium ${
                    page === pageNumber
                      ? "bg-[#106EE9] text-white"
                      : "bg-white/5 text-gray-300 hover:bg-white/10"
                  }`}
                >
                  {pageNumber}
                </button>
              );
            })}

            {/* Next */}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 rounded-lg bg-white/5 text-white hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
