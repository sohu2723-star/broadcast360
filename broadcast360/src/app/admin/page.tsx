"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { MoonSpinner } from "@/components/auth/AuthUi";

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

function DashboardSkeleton() {
  return (
    <div className="space-y-6" aria-label="Loading dashboard">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-32 animate-pulse rounded-2xl border border-white/10 bg-[#0B1026]" />)}
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
        if (!cancelled) setError(reason instanceof Error ? reason.message : "Dashboard data could not be loaded");
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
        <button type="button" onClick={() => window.location.reload()} className="mt-5 rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/20">Retry</button>
      </div>
    );
  }

  if (!data) return null;

  const dashboard = data;
  const stats = [
    { title: "Total Channels", value: dashboard.stats.totalChannels, icon: "TV", color: "text-cyan-200" },
    { title: "Live Streams", value: dashboard.stats.liveStreams, icon: "LIVE", color: "text-rose-300" },
    { title: "Movies", value: dashboard.stats.movies, icon: "MOV", color: "text-violet-300" },
    { title: "Users", value: dashboard.stats.users, icon: "USR", color: "text-emerald-300" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-200/70">Overview</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Dashboard</h1>
          <p className="mt-2 text-sm text-slate-400">Monitor Broadcast360 content and account activity.</p>
        </div>
        <Link href="/admin/channels" className="inline-flex w-fit rounded-xl border border-cyan-200/20 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-200/10">Manage channels</Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => (
          <div key={item.title} className="rounded-2xl border border-white/10 bg-[#0B1026] p-5 shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:border-cyan-200/20">
            <div className={`text-xs font-bold tracking-[0.2em] ${item.color}`}>{item.icon}</div>
            <p className="mt-6 text-sm text-gray-400">{item.title}</p>
            <h2 className="mt-1 text-3xl font-bold text-white sm:text-4xl">{item.value}</h2>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <section className="rounded-2xl border border-white/10 bg-[#0B1026] p-5 sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div><h2 className="text-xl font-bold">Live Status</h2><p className="mt-1 text-sm text-slate-500">Current channel availability</p></div>
            <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">Live monitor</span>
          </div>
          <div className="mt-5 divide-y divide-white/5">
            {dashboard.channels.length ? dashboard.channels.map((channel) => (
              <div key={channel.name} className="flex items-center justify-between gap-4 py-3 text-sm">
                <span className="min-w-0 truncate text-slate-200">{channel.name}</span>
                <span className={channel.status === "LIVE" ? "shrink-0 text-emerald-300" : "shrink-0 text-rose-300"}>● {channel.status}</span>
              </div>
            )) : <p className="py-8 text-sm text-slate-500">No channel status is available yet.</p>}
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-[#0B1026] p-5 sm:p-6">
          <h2 className="text-xl font-bold">Recent Activity</h2>
          <div className="mt-5 space-y-4">
            {dashboard.activities?.length ? dashboard.activities.slice(0, 6).map((activity, index) => (
              <div key={`${activity.message}-${index}`} className="border-l border-cyan-200/30 pl-3">
                <p className="text-sm text-slate-200">{activity.message}</p>
                <p className="mt-1 text-xs text-slate-500">{activity.time}</p>
              </div>
            )) : <p className="py-8 text-sm text-slate-500">No recent activity.</p>}
          </div>
        </section>
      </div>
    </div>
  );
}
