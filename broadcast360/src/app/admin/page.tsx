"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { MoonSpinner } from "@/components/auth/AuthUi";
import {
  Activity,
  BarChart3,
  Clock3,
  Eye,
  Film,
  Gem,
  Heart,
  ListChecks,
  Megaphone,
  Radio,
  Tv,
  UserCheck,
  Users,
  type LucideIcon,
} from "lucide-react";

type MetricRow = {
  title: string;
  value: string | number;
  hint: string;
  tone?: string;
  icon: LucideIcon;
};
type DashboardData = {
  generatedAt: string;
  rangeDays: number;
  stats: {
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    bannedUsers: number;
    premiumUsers: number;
    totalChannels: number;
    liveStreams: number;
    movies: number;
  };
  userActivity: { day: string; activeUsers: number; watchEvents: number }[];
  popularChannels: { channelId: number; name: string; views: number; uniqueUsers: number }[];
  mostWatched: { type: string; contentId: number; title: string; views: number; uniqueUsers: number }[];
  mostFavourite: { type: string; contentId: number; title: string; favourites: number; uniqueUsers: number }[];
  peakWatchingTime: { hour: number; views: number }[];
  liveBroadcastViewers: { activeViewers: number; sessionsLast24h: number; channels: { channelId: number; name: string; viewers: number }[] };
  advertisementPerformance: { advertisementId: number; title: string; impressions: number; completions: number; clicks: number; completionRate: number }[];
  channels: { name: string; status: string }[];
  activities: { message: string; time: string | Date }[];
};

const numberFormatter = new Intl.NumberFormat("en-US");

function formatNumber(value: number) {
  return numberFormatter.format(value || 0);
}

function formatHour(hour: number) {
  const normalized = ((hour % 24) + 24) % 24;
  const suffix = normalized >= 12 ? "PM" : "AM";
  const display = normalized % 12 || 12;
  return `${display}:00 ${suffix}`;
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6" aria-label="Loading analytics dashboard">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => <div key={index} className="h-32 animate-pulse rounded-2xl border border-white/10 bg-[#0B1026]" />)}
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-72 animate-pulse rounded-2xl border border-white/10 bg-[#0B1026]" />)}
      </div>
    </div>
  );
}

function Panel({ title, subtitle, icon: Icon, children, className = "" }: { title: string; subtitle?: string; icon?: LucideIcon; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-white/10 bg-[#0B1026] p-5 shadow-lg shadow-black/10 sm:p-6 ${className}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            {Icon ? (
              <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#7898bf]/20 bg-[#7898bf]/10 text-[#b8cee8]" aria-hidden="true">
                <Icon size={16} strokeWidth={1.8} />
              </span>
            ) : null}
            <h2 className="text-lg font-bold text-white">{title}</h2>
          </div>
          {subtitle ? <p className="mt-1 text-xs leading-5 text-slate-500">{subtitle}</p> : null}
        </div>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function EmptyAnalytics({ message = "No recorded data for this period yet." }: { message?: string }) {
  return <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-8 text-center text-sm text-slate-500">{message}</div>;
}

function UserActivityChart({ rows }: { rows: DashboardData["userActivity"] }) {
  const visible = rows.slice(-14);
  const max = Math.max(1, ...visible.map((row) => Math.max(row.activeUsers, row.watchEvents)));
  if (!visible.length) return <EmptyAnalytics />;
  return (
    <div>
      <div className="flex h-44 items-end gap-1.5 overflow-hidden rounded-xl border border-white/5 bg-[#080D20] px-3 pb-3 pt-5 sm:gap-2">
        {visible.map((row) => {
          const activeHeight = Math.max(4, Math.round((row.activeUsers / max) * 100));
          const watchHeight = Math.max(4, Math.round((row.watchEvents / max) * 100));
          return (
            <div key={row.day} className="group flex min-w-0 flex-1 items-end justify-center gap-0.5" title={`${row.day}: ${row.activeUsers} active users, ${row.watchEvents} watch events`}>
              <div className="w-1/2 rounded-t bg-[#7898bf]/80 transition group-hover:bg-[#a9bfd9]" style={{ height: `${activeHeight}%` }} />
              <div className="w-1/2 rounded-t bg-[#d7b36a]/80 transition group-hover:bg-[#f0d48b]" style={{ height: `${watchHeight}%` }} />
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex items-center justify-between text-[10px] text-slate-600"><span>{visible[0]?.day}</span><span>{visible[visible.length - 1]?.day}</span></div>
      <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-400"><span><i className="mr-1.5 inline-block h-2 w-2 rounded-full bg-[#7898bf]" />Active users</span><span><i className="mr-1.5 inline-block h-2 w-2 rounded-full bg-[#d7b36a]" />Watch events</span></div>
    </div>
  );
}

function RankedBars({ rows, valueKey, valueLabel }: { rows: { name?: string; title?: string; views?: number; favourites?: number; uniqueUsers?: number }[]; valueKey: "views" | "favourites"; valueLabel: string }) {
  const max = Math.max(1, ...rows.map((row) => Number(row[valueKey] ?? 0)));
  if (!rows.length) return <EmptyAnalytics />;
  return (
    <div className="space-y-3">
      {rows.slice(0, 6).map((row, index) => {
        const label = row.name ?? row.title ?? "Untitled";
        const value = Number(row[valueKey] ?? 0);
        return (
          <div key={`${label}-${index}`}>
            <div className="mb-1.5 flex items-center justify-between gap-3 text-xs"><span className="min-w-0 truncate text-slate-300">{index + 1}. {label}</span><span className="shrink-0 font-semibold text-slate-200">{formatNumber(value)} {valueLabel}</span></div>
            <div className="h-2 overflow-hidden rounded-full bg-white/5"><div className="h-full rounded-full bg-[#7898bf] transition-all" style={{ width: `${Math.max(3, (value / max) * 100)}%` }} /></div>
          </div>
        );
      })}
    </div>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState("");
  const [days, setDays] = useState("30");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    fetch(`/api/analytics/dashboard?days=${days}`, { credentials: "include", cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Analytics data could not be loaded");
        return response.json() as Promise<DashboardData & { success?: boolean }>;
      })
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((reason: unknown) => {
        if (!cancelled) setError(reason instanceof Error ? reason.message : "Analytics data could not be loaded");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [days]);

  const activeRate = useMemo(() => data && data.stats.totalUsers > 0 ? Math.round((data.stats.activeUsers / data.stats.totalUsers) * 100) : 0, [data]);
  const peakHour = useMemo(() => data?.peakWatchingTime.reduce((best, row) => row.views > (best?.views ?? -1) ? row : best, null as DashboardData["peakWatchingTime"][number] | null), [data]);

  if (loading && !data) return <DashboardSkeleton />;
  if (error && !data) {
    return <div className="rounded-3xl border border-rose-300/20 bg-rose-400/10 p-6 text-rose-100"><h1 className="text-xl font-semibold">Analytics unavailable</h1><p className="mt-2 text-sm text-rose-100/80">{error}</p><button type="button" onClick={() => window.location.reload()} className="mt-5 rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/20">Retry</button></div>;
  }
  if (!data) return null;

  const metricCards: MetricRow[] = [
    { title: "Total Users", value: formatNumber(data.stats.totalUsers), hint: `${activeRate}% active`, tone: "text-[#b8cee8]", icon: Users },
    { title: "Active Users", value: formatNumber(data.stats.activeUsers), hint: `${formatNumber(data.stats.inactiveUsers)} inactive`, tone: "text-emerald-200", icon: UserCheck },
    { title: "Premium Users", value: formatNumber(data.stats.premiumUsers), hint: "Active subscriptions", tone: "text-[#d7b36a]", icon: Gem },
    { title: "Live Viewers", value: formatNumber(data.liveBroadcastViewers.activeViewers), hint: `${formatNumber(data.liveBroadcastViewers.sessionsLast24h)} sessions / 24h`, tone: "text-[#a9bfd9]", icon: Eye },
    { title: "Live Streams", value: formatNumber(data.stats.liveStreams), hint: `${formatNumber(data.stats.totalChannels)} total channels`, tone: "text-rose-200", icon: Radio },
  ];

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div><p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#7898bf]">Decision dashboard</p><h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">User & Content Analytics</h1><p className="mt-2 max-w-2xl text-sm text-slate-400">Measure audience activity, content demand, live viewing, and advertisement delivery from recorded platform events.</p></div>
        <div className="flex flex-wrap items-center gap-2"><label htmlFor="analytics-range" className="text-xs font-semibold text-slate-500">Range</label><select id="analytics-range" value={days} onChange={(event) => setDays(event.target.value)} className="rounded-xl border border-white/10 bg-[#101a3a] px-3 py-2 text-sm text-slate-200 outline-none focus:border-[#7898bf]"><option value="7">Last 7 days</option><option value="30">Last 30 days</option><option value="90">Last 90 days</option></select><Link href="/admin/channels" className="rounded-xl border border-[#7898bf]/30 px-4 py-2 text-sm font-semibold text-[#b8cee8] transition hover:bg-[#7898bf]/10">Manage channels</Link></div>
      </div>

      {error ? <div className="rounded-xl border border-amber-200/20 bg-amber-100/5 px-4 py-3 text-sm text-amber-100">Showing the last successful analytics snapshot. {error}</div> : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {metricCards.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="rounded-2xl border border-white/10 bg-[#0B1026] p-5 shadow-lg shadow-black/10">
              <div className="flex items-start justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{item.title}</p>
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#7898bf]/20 bg-[#7898bf]/10 text-[#b8cee8]" aria-hidden="true">
                  <Icon size={18} strokeWidth={1.8} />
                </span>
              </div>
              <p className={`mt-4 text-3xl font-bold ${item.tone}`}>{item.value}</p>
              <p className="mt-2 text-xs text-slate-500">{item.hint}</p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
                <Panel icon={Activity} title="Daily / Weekly / Monthly User Activity" subtitle={`Daily active users and watch events over the last ${data.rangeDays} days.`}><UserActivityChart rows={data.userActivity} /></Panel>
        <Panel icon={Clock3} title="Peak Watching Time" subtitle="Watch-history events grouped by local database hour.">
<div className="flex items-end gap-1.5 overflow-hidden rounded-xl border border-white/5 bg-[#080D20] px-3 pb-3 pt-6">{Array.from({ length: 24 }).map((_, hour) => { const row = data.peakWatchingTime.find((item) => item.hour === hour); const max = Math.max(1, ...data.peakWatchingTime.map((item) => item.views)); const height = Math.max(3, Math.round(((row?.views ?? 0) / max) * 100)); return <div key={hour} className="group flex min-w-0 flex-1 items-end" title={`${formatHour(hour)}: ${formatNumber(row?.views ?? 0)} views`}><div className="w-full rounded-t bg-[#d7b36a]/80 group-hover:bg-[#f0d48b]" style={{ height: `${height}%` }} /></div>; })}</div><div className="mt-3 flex justify-between text-[10px] text-slate-600"><span>12 AM</span><span>6 AM</span><span>12 PM</span><span>6 PM</span><span>12 AM</span></div><p className="mt-4 rounded-xl border border-[#d7b36a]/20 bg-[#d7b36a]/5 px-3 py-2 text-xs text-[#f0d48b]">Peak period: {peakHour ? `${formatHour(peakHour.hour)} with ${formatNumber(peakHour.views)} watch events` : "Not enough data yet"}</p></Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel icon={BarChart3} title="Most Popular Channels" subtitle="Ranked by recorded watch-history events in the selected range."><RankedBars rows={data.popularChannels} valueKey="views" valueLabel="views" /></Panel>
        <Panel icon={Heart} title="Most Favourite Content" subtitle="Ranked by favorites created in the selected range."><RankedBars rows={data.mostFavourite} valueKey="favourites" valueLabel="favorites" /></Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                <Panel icon={Film} title="Most Watched Content" subtitle="Top movies, episodes, entertainment, and news by watch events.">
<div className="overflow-x-auto"><table className="w-full min-w-[520px] text-left text-sm"><thead className="border-b border-white/10 text-xs uppercase tracking-[0.12em] text-slate-500"><tr><th className="pb-3 pr-3">Content</th><th className="pb-3 pr-3">Type</th><th className="pb-3 text-right">Views</th><th className="pb-3 text-right">Users</th></tr></thead><tbody className="divide-y divide-white/5">{data.mostWatched.length ? data.mostWatched.slice(0, 8).map((row) => <tr key={`${row.type}-${row.contentId}`}><td className="max-w-[230px] truncate py-3 pr-3 text-slate-200">{row.title}</td><td className="py-3 pr-3 text-xs text-slate-500">{row.type}</td><td className="py-3 text-right font-semibold text-[#b8cee8]">{formatNumber(row.views)}</td><td className="py-3 text-right text-slate-400">{formatNumber(row.uniqueUsers)}</td></tr>) : <tr><td colSpan={4} className="py-8"><EmptyAnalytics /></td></tr>}</tbody></table></div></Panel>
                <Panel icon={Radio} title="Live Broadcast Viewer Analytics" subtitle="Active viewer sessions are refreshed by live-TV heartbeat telemetry.">
<div className="grid gap-3 sm:grid-cols-2"><div className="rounded-xl border border-[#7898bf]/20 bg-[#7898bf]/5 p-4"><p className="text-xs text-slate-500">Active now</p><p className="mt-1 text-2xl font-bold text-[#b8cee8]">{formatNumber(data.liveBroadcastViewers.activeViewers)}</p></div><div className="rounded-xl border border-white/10 bg-white/[0.02] p-4"><p className="text-xs text-slate-500">Sessions / 24h</p><p className="mt-1 text-2xl font-bold text-white">{formatNumber(data.liveBroadcastViewers.sessionsLast24h)}</p></div></div><div className="mt-5 space-y-3">{data.liveBroadcastViewers.channels.length ? data.liveBroadcastViewers.channels.slice(0, 6).map((row) => <div key={row.channelId} className="flex items-center justify-between border-b border-white/5 pb-2 text-sm"><span className="truncate text-slate-300">{row.name}</span><span className="font-semibold text-emerald-200">{formatNumber(row.viewers)} viewers</span></div>) : <EmptyAnalytics message="No live viewer heartbeat has been recorded yet." />}</div></Panel>
      </div>

            <Panel icon={Megaphone} title="Advertisement Performance" subtitle="Impressions, completions, clicks, and completion rate from recorded advertisement events.">
<div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left text-sm"><thead className="border-b border-white/10 text-xs uppercase tracking-[0.12em] text-slate-500"><tr><th className="pb-3 pr-3">Advertisement</th><th className="pb-3 text-right">Impressions</th><th className="pb-3 text-right">Completions</th><th className="pb-3 text-right">Clicks</th><th className="pb-3 text-right">Completion rate</th></tr></thead><tbody className="divide-y divide-white/5">{data.advertisementPerformance.length ? data.advertisementPerformance.map((row) => <tr key={row.advertisementId}><td className="max-w-[300px] truncate py-3 pr-3 text-slate-200">{row.title}</td><td className="py-3 text-right text-slate-300">{formatNumber(row.impressions)}</td><td className="py-3 text-right text-slate-300">{formatNumber(row.completions)}</td><td className="py-3 text-right text-slate-300">{formatNumber(row.clicks)}</td><td className="py-3 text-right font-semibold text-[#d7b36a]">{row.completionRate.toFixed(1)}%</td></tr>) : <tr><td colSpan={5} className="py-8"><EmptyAnalytics message="No advertisement events have been recorded yet. The dashboard will populate as ads emit impression/completion/click events." /></td></tr>}</tbody></table></div></Panel>

            <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]"><Panel icon={Tv} title="Live Status" subtitle="Current channel availability.">
<div className="divide-y divide-white/5">{data.channels.length ? data.channels.map((channel) => <div key={channel.name} className="flex items-center justify-between gap-4 py-3 text-sm"><span className="min-w-0 truncate text-slate-200">{channel.name}</span><span className={channel.status === "LIVE" ? "shrink-0 text-emerald-300" : "shrink-0 text-slate-500"}>● {channel.status}</span></div>) : <EmptyAnalytics message="No channel status is available yet." />}</div></Panel><Panel icon={ListChecks} title="Recent Activity" subtitle="Latest channel and broadcast events.">
<div className="space-y-4">{data.activities?.length ? data.activities.slice(0, 6).map((activity, index) => <div key={`${activity.message}-${index}`} className="border-l border-[#7898bf]/30 pl-3"><p className="text-sm text-slate-200">{activity.message}</p><p className="mt-1 text-xs text-slate-500">{new Date(activity.time).toLocaleString()}</p></div>) : <EmptyAnalytics message="No recent activity." />}</div></Panel></div>

      <div className="flex items-center justify-between text-xs text-slate-600"><span>Analytics range: last {data.rangeDays} days.</span><span>Updated {new Date(data.generatedAt).toLocaleString()}</span></div>
    </div>
  );
}
