"use client";

import { useEffect, useState } from "react";
import { ChevronRight, Tv } from "lucide-react";

import {
  getPremiumSchedules,
  Schedule,
} from "@/services/schedule.service";

import { channelService } from "@/services/channel.service";
import type { Channel } from "@/types";

export default function SchedulePage() {
  const [schedules, setSchedules] =
    useState<Schedule[]>([]);

  const [channels, setChannels] =
    useState<Channel[]>([]);

  const [selectedChannelId, setSelectedChannelId] =
    useState<number | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [channelsLoading, setChannelsLoading] =
    useState(true);

  const [premiumRequired, setPremiumRequired] =
    useState(false);

  const [loginRequired, setLoginRequired] =
    useState(false);

  const [error, setError] =
    useState("");

  const [page, setPage] =
    useState(1);

  const [pagination, setPagination] =
    useState({
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    });

  // =====================================================
  // LOAD CHANNELS
  // =====================================================

  useEffect(() => {
    async function loadChannels() {
      try {
        setChannelsLoading(true);

        const data =
          await channelService.getAllChannels();

        setChannels(data);
      } catch (error) {
        console.error(
          "LOAD CHANNELS FAILED:",
          error,
        );
      } finally {
        setChannelsLoading(false);
      }
    }

    loadChannels();
  }, []);

  // =====================================================
  // LOAD SCHEDULES
  // =====================================================

  useEffect(() => {
    loadSchedules(page);
  }, [
    page,
    selectedChannelId,
  ]);

  async function loadSchedules(
    currentPage: number,
  ) {
    try {
      setLoading(true);

      setPremiumRequired(false);
      setLoginRequired(false);
      setError("");

      const response =
        await getPremiumSchedules(
          currentPage,
          10,
          selectedChannelId,
        );

      setSchedules(
        Array.isArray(response.data)
          ? response.data
          : [],
      );

      setPagination(
        response.pagination,
      );
    } catch (error: any) {
      console.error(
        "Schedule page error:",
        error,
      );

      const status =
        error?.response?.status;

      // =================================================
      // NOT LOGGED IN
      // =================================================

      if (status === 401) {
        setLoginRequired(true);
        setSchedules([]);
        return;
      }

      // =================================================
      // NOT PREMIUM
      // =================================================

      if (status === 403) {
        setPremiumRequired(true);
        setSchedules([]);
        return;
      }

      setError(
        "Cannot load schedules.",
      );

      setSchedules([]);
    } finally {
      setLoading(false);
    }
  }

  // =====================================================
  // CHANNEL FILTER
  // =====================================================

  function handleChannelChange(
    channelId: number | null,
  ) {
    setPage(1);
    setSelectedChannelId(
      channelId,
    );
  }

  // =====================================================
  // LOADING
  // =====================================================

  if (
    loading &&
    schedules.length === 0 &&
    !loginRequired &&
    !premiumRequired
  ) {
    return (
      <main className="min-h-screen bg-gray-950 text-white">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <h1 className="mb-8 text-3xl font-bold">
            TV Schedule
          </h1>

          <div className="rounded-xl bg-gray-900 p-8 text-center text-gray-400">
            Loading schedule...
          </div>
        </div>
      </main>
    );
  }

  // =====================================================
  // LOGIN REQUIRED
  // =====================================================

  if (loginRequired) {
    return (
      <main className="min-h-screen bg-gray-950 text-white">
        <div className="mx-auto max-w-7xl px-6 py-12">

          <h1 className="mb-8 text-3xl font-bold">
            TV Schedule
          </h1>

          <div className="mx-auto max-w-lg rounded-2xl border border-gray-800 bg-gray-900 p-10 text-center shadow-xl">

            <h2 className="mb-3 text-2xl font-bold">
              Login Required
            </h2>

            <p className="mb-2 text-gray-300">
              Sign in to view the TV schedule.
            </p>

            <p className="mb-7 text-sm text-gray-500">
              Premium users can view today's
              schedule and the next 3 days.
            </p>

            <div className="flex flex-col justify-center gap-3 sm:flex-row">

              <a
                href="/login"
                className="rounded-lg bg-yellow-500 px-6 py-3 font-semibold text-black transition hover:bg-yellow-400"
              >
                Login
              </a>

              <a
                href="/register"
                className="rounded-lg border border-gray-700 bg-gray-800 px-6 py-3 font-semibold text-white transition hover:bg-gray-700"
              >
                Create Account
              </a>

            </div>
          </div>
        </div>
      </main>
    );
  }

  // =====================================================
  // PREMIUM REQUIRED
  // =====================================================

  if (premiumRequired) {
    return (
      <main className="min-h-screen bg-gray-950 text-white">
        <div className="mx-auto max-w-7xl px-6 py-12">

          <h1 className="mb-8 text-3xl font-bold">
            TV Schedule
          </h1>

          <div className="mx-auto max-w-lg rounded-2xl border border-yellow-500/30 bg-gray-900 p-10 text-center shadow-xl">

            <h2 className="mb-3 text-2xl font-bold">
              Premium Schedule
            </h2>

            <p className="mb-2 text-gray-300">
              This schedule is available to
              Premium subscribers.
            </p>

            <p className="mb-7 text-sm text-gray-500">
              Upgrade to Premium to see today's
              programs and the next 3 days.
            </p>

            <a
              href="/subscription"
              className="inline-block rounded-lg bg-yellow-500 px-6 py-3 font-semibold text-black transition hover:bg-yellow-400"
            >
              Get Premium
            </a>

          </div>
        </div>
      </main>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
    return (
      <main className="min-h-screen bg-gray-950 text-white">
        <div className="mx-auto max-w-7xl px-6 py-12">

          <h1 className="mb-8 text-3xl font-bold">
            TV Schedule
          </h1>

          <div className="rounded-xl bg-red-500/10 p-6 text-red-400">
            {error}
          </div>

        </div>
      </main>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <main className="min-h-screen bg-gray-950 text-white">

      <div className="mx-auto max-w-7xl px-6 py-12">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-8">

          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">

            <div>
              <h1 className="text-3xl font-bold">
                TV Schedule
              </h1>

              <p className="mt-2 text-gray-400">
                Today and the next 3 days.
              </p>
            </div>

            {selectedChannelId && (
              <div className="text-sm text-gray-500">
                {schedules.length} program
                {schedules.length !== 1
                  ? "s"
                  : ""}
              </div>
            )}

          </div>
        </div>

        {/* =================================================
            CHANNEL FILTER
        ================================================= */}

        <div className="mb-8">

          <div className="mb-3 flex items-center justify-between">

            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
              Filter by Channel
            </h2>

            {selectedChannelId && (
              <button
                type="button"
                onClick={() =>
                  handleChannelChange(null)
                }
                className="text-xs font-medium text-yellow-400 hover:text-yellow-300"
              >
                Clear filter
              </button>
            )}

          </div>

          {channelsLoading ? (
            <div className="rounded-xl border border-gray-800 bg-gray-900 p-4 text-sm text-gray-500">
              Loading channels...
            </div>
          ) : channels.length === 0 ? (
            <div className="rounded-xl border border-gray-800 bg-gray-900 p-4 text-sm text-gray-500">
              No channels available.
            </div>
          ) : (
            <div className="flex gap-3 overflow-x-auto pb-2">

              {/* ALL CHANNELS */}

              <button
                type="button"
                onClick={() =>
                  handleChannelChange(null)
                }
                className={`flex min-w-[150px] shrink-0 items-center gap-3 rounded-xl border px-4 py-3 text-left transition ${
                  selectedChannelId === null
                    ? "border-yellow-500 bg-yellow-500/10 text-yellow-400"
                    : "border-gray-800 bg-gray-900 text-gray-300 hover:border-gray-700 hover:bg-gray-800"
                }`}
              >

                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${
                    selectedChannelId === null
                      ? "bg-yellow-500 text-black"
                      : "bg-gray-800 text-gray-400"
                  }`}
                >
                  TV
                </div>

                <div>
                  <div className="text-sm font-semibold">
                    All Channels
                  </div>

                  <div className="text-xs text-gray-500">
                    View all
                  </div>
                </div>

              </button>

              {/* CHANNELS */}

              {channels.map((channel) => {

                const active =
                  selectedChannelId ===
                  channel.id;

                return (
                  <button
                    key={channel.id}
                    type="button"
                    onClick={() =>
                      handleChannelChange(
                        channel.id,
                      )
                    }
                    className={`flex min-w-[180px] shrink-0 items-center gap-3 rounded-xl border px-4 py-3 text-left transition ${
                      active
                        ? "border-yellow-500 bg-yellow-500/10"
                        : "border-gray-800 bg-gray-900 hover:border-gray-700 hover:bg-gray-800"
                    }`}
                  >

                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg ${
                        active
                          ? "bg-yellow-500"
                          : "bg-gray-800"
                      }`}
                    >

                      {channel.logo ? (
                        <img
                          src={channel.logo}
                          alt={channel.name}
                          className="h-full w-full object-contain p-1"
                        />
                      ) : (
                        <span
                          className={`text-xs font-bold ${
                            active
                              ? "text-black"
                              : "text-gray-400"
                          }`}
                        >
                          TV
                        </span>
                      )}

                    </div>

                    <div className="min-w-0">

                      <div
                        className={`truncate text-sm font-semibold ${
                          active
                            ? "text-yellow-400"
                            : "text-gray-200"
                        }`}
                      >
                        {channel.name}
                      </div>

                      <div className="text-xs text-gray-500">
                        Channel {channel.id}
                      </div>

                    </div>

                  </button>
                );
              })}

            </div>
          )}

        </div>

        {/* =================================================
            SELECTED CHANNEL
        ================================================= */}

        {selectedChannelId && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-yellow-500/20 bg-yellow-500/5 px-4 py-3">

            {channels.find(
              (channel) =>
                channel.id ===
                selectedChannelId,
            )?.logo && (
              <img
                src={
                  channels.find(
                    (channel) =>
                      channel.id ===
                      selectedChannelId,
                  )?.logo ?? ""
                }
                alt=""
                className="h-9 w-9 rounded-lg object-contain"
              />
            )}

            <div>
              <div className="text-xs text-gray-500">
                Showing schedule for
              </div>

              <div className="font-semibold text-yellow-400">
                {
                  channels.find(
                    (channel) =>
                      channel.id ===
                      selectedChannelId,
                  )?.name
                }
              </div>
            </div>

          </div>
        )}

        {/* =================================================
            SCHEDULE LIST
        ================================================= */}

        {loading ? (
          <div className="rounded-xl bg-gray-900 p-10 text-center text-gray-400">
            Loading schedule...
          </div>
        ) : schedules.length === 0 ? (
          <div className="rounded-xl bg-gray-900 p-10 text-center">

            <div className="mb-3 flex justify-center text-[#7898bf]">
              <Tv size={42} strokeWidth={1.5} aria-hidden="true" />
            </div>

            <p className="font-semibold text-gray-300">
              No schedules available.
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Try another channel or select
              All Channels.
            </p>

          </div>
        ) : (
          <div className="space-y-4">

            {schedules.map(
              (schedule) => (
                <ScheduleCard
                  key={schedule.id}
                  schedule={schedule}
                />
              ),
            )}

          </div>
        )}

        {/* =================================================
            PAGINATION
        ================================================= */}

        {pagination.totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-4">

            <button
              disabled={page <= 1 || loading}
              onClick={() =>
                setPage((current) =>
                  Math.max(
                    1,
                    current - 1,
                  ),
                )
              }
              className="rounded-lg bg-gray-800 px-5 py-2 text-sm font-medium hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              ← Previous
            </button>

            <span className="text-sm text-gray-400">
              Page {pagination.page} of{" "}
              {pagination.totalPages}
            </span>

            <button
              disabled={
                page >=
                  pagination.totalPages ||
                loading
              }
              onClick={() =>
                setPage((current) =>
                  Math.min(
                    pagination.totalPages,
                    current + 1,
                  ),
                )
              }
              className="rounded-lg bg-gray-800 px-5 py-2 text-sm font-medium hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <span className="inline-flex items-center gap-1.5">Next <ChevronRight size={15} aria-hidden="true" /></span>
            </button>

          </div>
        )}

      </div>
    </main>
  );
}

// =======================================================
// SCHEDULE CARD
// =======================================================

function ScheduleCard({
  schedule,
}: {
  schedule: Schedule;
}) {
  const start =
    new Date(schedule.startTime);

  const end =
    schedule.endTime
      ? new Date(schedule.endTime)
      : null;

  const now = new Date();

  const isNowPlaying =
    start <= now &&
    (!end || end > now) &&
    schedule.status !==
      "CANCELLED";

  const isPassed =
    end !== null &&
    end <= now;

  const isUpcoming =
    start > now;

  return (
    <div
      className={`rounded-xl border bg-gray-900 p-5 transition ${
        isNowPlaying
          ? "border-green-500/50 shadow-lg shadow-green-500/5"
          : "border-gray-800"
      }`}
    >

      <div className="flex flex-col gap-5 md:flex-row md:items-center">

        {/* CHANNEL */}

        <div className="flex min-w-[240px] items-center gap-4">

          {schedule.channel?.logo ? (
            <img
              src={schedule.channel.logo}
              alt={
                schedule.channel.name
              }
              className="h-14 w-14 rounded-lg object-contain"
            />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-gray-800 text-sm font-bold">
              TV
            </div>
          )}

          <div>

            <h2 className="font-semibold">
              {schedule.channel?.name}
            </h2>

            <p className="mt-1 text-sm text-gray-400">
              {schedule.playlist?.name}
            </p>

          </div>

        </div>

        {/* TIME */}

        <div className="flex-1">

          <p className="font-semibold">
            {formatTime(start)}
            {" - "}
            {end
              ? formatTime(end)
              : "LIVE"}
          </p>

          <p className="mt-1 text-sm text-gray-500">
            {formatDate(start)}
          </p>

        </div>

        {/* STATUS */}

        <div className="flex items-center gap-3">

          {isNowPlaying ? (
            <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-bold text-green-400">
              ● NOW PLAYING
            </span>
          ) : isPassed ? (
            <span className="rounded-full bg-gray-500/10 px-3 py-1 text-xs font-semibold text-gray-400">
              PASSED
            </span>
          ) : isUpcoming ? (
            <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-400">
              UPCOMING
            </span>
          ) : (
            <StatusBadge
              status={schedule.status}
            />
          )}

        </div>

      </div>

    </div>
  );
}

// =======================================================
// STATUS BADGE
// =======================================================

function StatusBadge({
  status,
}: {
  status: Schedule["status"];
}) {
  const styles = {
    SCHEDULED:
      "bg-blue-500/10 text-blue-400",

    LIVE:
      "bg-green-500/10 text-green-400",

    COMPLETED:
      "bg-gray-500/10 text-gray-400",

    CANCELLED:
      "bg-red-500/10 text-red-400",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${styles[status]}`}
    >
      {status}
    </span>
  );
}

// =======================================================
// FORMAT TIME
// =======================================================

function formatTime(date: Date) {
  return date.toLocaleTimeString(
    [],
    {
      hour: "2-digit",
      minute: "2-digit",
    },
  );
}

// =======================================================
// FORMAT DATE
// =======================================================

function formatDate(date: Date) {
  return date.toLocaleDateString(
    [],
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    },
  );
}