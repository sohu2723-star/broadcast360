"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { MoonSpinner } from "@/components/auth/AuthUi";
import {
  Activity,
  Circle,
  Film,
  Radio,
  Tv,
  Users,
  type LucideIcon,
} from "lucide-react";

type DashboardData = {
  stats: {
    totalChannels: number;
    liveStreams: number;
    movies: number;
    users: number;
  };
  channels: { name: string; status: string }[];
  activities: { message: string; time: string }[];
};

type DashboardCard = {
  title: string;
  value: number;
  icon: LucideIcon;
  color: string;
};

function DashboardSkeleton() {
  return (
    <div className="space-y-6" aria-label="Loading dashboard">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-32 animate-pulse rounded-2xl border border-white/10 bg-[#0B1026]"
          />
        ))}
      </div>
      <div className="h-72 animate-pulse rounded-2xl border border-white/10 bg-[#0B1026]" />
    </div>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    fetch("/api/dashboard", { credentials: "include", cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Dashboard data could not be loaded");
        return response.json() as Promise<DashboardData>;
      })
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((reason: unknown) => {
        if (!cancelled) {
          setError(
            reason instanceof Error
              ? reason.message
              : "Dashboard data could not be loaded",
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (!data && !error) return <DashboardSkeleton />;

  if (error) {
    return (
      <div className="rounded-3xl border border-rose-300/20 bg-rose-400/10 p-6 text-rose-100">
        <h1 className="text-xl font-semibold">Dashboard unavailable</h1>
        <p className="mt-2 text-sm text-rose-100/80">{error}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-5 rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/20"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data) return null;

  const dashboardCards: DashboardCard[] = [
    {
      title: "Total Channels",
      value: data.stats.totalChannels,
      icon: Tv,
      color: "text-[#9dbbd7]",
    },
    {
      title: "Live Streams",
      value: data.stats.liveStreams,
      icon: Radio,
      color: "text-rose-300",
    },
    {
      title: "Movies",
      value: data.stats.movies,
      icon: Film,
      color: "text-[#b7c9e1]",
    },
    {
      title: "Users",
      value: data.stats.users,
      icon: Users,
      color: "text-[#9dbbd7]",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#7898bf]/80">
            Overview
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
            Dashboard
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Monitor Broadcast360 content and account activity.
          </p>
        </div>
        <Link
          href="/admin/channels"
          className="inline-flex w-fit rounded-xl border border-[#7898bf]/30 px-4 py-2 text-sm font-semibold text-[#b8cee8] transition hover:bg-[#7898bf]/10"
        >
          Manage channels
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {dashboardCards.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="rounded-2xl border border-white/10 bg-[#0B1026] p-5 shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:border-[#7898bf]/30"
            >
              <div className={`flex h-9 w-9 items-center justify-center ${item.color}`}>
                <Icon size={28} strokeWidth={1.7} aria-hidden="true" />
              </div>
              <p className="mt-6 text-sm text-gray-400">{item.title}</p>
              <h2 className="mt-1 text-3xl font-bold text-white sm:text-4xl">
                {item.value}
              </h2>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <section className="rounded-2xl border border-white/10 bg-[#0B1026] p-5 sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <span
                className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#7898bf]/20 bg-[#7898bf]/10 text-[#b8cee8]"
                aria-hidden="true"
              >
                <Tv size={18} strokeWidth={1.8} />
              </span>
              <div>
                <h2 className="text-xl font-bold">Live Status</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Current channel availability
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">
              <Radio size={13} strokeWidth={1.8} aria-hidden="true" />
              Live monitor
            </span>
          </div>
          <div className="mt-5 divide-y divide-white/5">
            {data.channels.length ? (
              data.channels.map((channel) => {
                const isLive = channel.status === "LIVE";

                return (
                  <div
                    key={channel.name}
                    className="flex items-center justify-between gap-4 py-3 text-sm"
                  >
                    <span className="min-w-0 truncate text-slate-200">
                      {channel.name}
                    </span>
                    <span
                      className={
                        isLive
                          ? "inline-flex shrink-0 items-center gap-1.5 text-emerald-300"
                          : "inline-flex shrink-0 items-center gap-1.5 text-rose-300"
                      }
                    >
                      <Circle
                        size={8}
                        fill="currentColor"
                        strokeWidth={0}
                        aria-hidden="true"
                      />
                      {channel.status}
                    </span>
                  </div>
                );
              })
            ) : (
              <p className="py-8 text-sm text-slate-500">
                No channel status is available yet.
              </p>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-[#0B1026] p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <span
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#7898bf]/20 bg-[#7898bf]/10 text-[#b8cee8]"
              aria-hidden="true"
            >
              <Activity size={18} strokeWidth={1.8} />
            </span>
            <h2 className="text-xl font-bold">Recent Activity</h2>
          </div>
          <div className="mt-5 space-y-4">
            {data.activities?.length ? (
              data.activities.slice(0, 6).map((activity, index) => (
                <div
                  key={`${activity.message}-${index}`}
                  className="border-l border-[#7898bf]/30 pl-3"
                >
                  <p className="text-sm text-slate-200">{activity.message}</p>
                  <p className="mt-1 text-xs text-slate-500">{activity.time}</p>
                </div>
              ))
            ) : (
              <p className="py-8 text-sm text-slate-500">No recent activity.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
