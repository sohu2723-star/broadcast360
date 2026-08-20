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
      <div className="mb-8 flex items-center justify-between gap-4">
        <div className="flex w-full max-w-2xl gap-3">
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
          className="rounded-xl bg-[#4f6689] px-5 py-3"
        >
          + Add Schedule
        </Link>
      </div>

      {/* TABLE */}
      <ScheduleTable schedules={schedules} loading={loading} />

      {/* PAGINATION */}
      {/* PAGINATION */}
      {!loading && totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between rounded-xl border border-white/10 bg-[#0B1026] px-5 py-4">
          {/* Page Info */}
          <div className="text-sm text-gray-400">
            Page <span className="font-semibold text-white">{page}</span> of{" "}
            <span className="font-semibold text-white">{totalPages}</span>
          </div>

          {/* Pagination */}
          <div className="flex items-center gap-2">
            {/* Previous */}
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-lg bg-white/5 px-4 py-2 text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
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
                  className={`h-10 w-10 rounded-lg font-medium transition ${
                    page === pageNumber
                      ? "bg-[#4f6689] text-white"
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
              className="rounded-lg bg-white/5 px-4 py-2 text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
