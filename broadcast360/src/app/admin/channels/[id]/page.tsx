"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Tv,
  Radio,
  ListVideo,
  Globe,
  Calendar,
  Key,
  Save,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  Sliders,
  Activity,
  AlertTriangle,
} from "lucide-react";

type Playlist = {
  id: number;
  name: string;
  totalDuration: number | null;
};

type Channel = {
  id: number;
  name: string;
  streamKey: string;
  description: string | null;
  logo: string | null;
  country: string | null;
  createdAt: string;
  defaultPlaylistId: number | null;
  playlists: Playlist[];
};

export default function ChannelDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [channel, setChannel] = useState<Channel | null>(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function getChannel() {
      try {
        const res = await fetch(`/api/channels/${id}`);

        if (!res.ok) {
          throw new Error("Failed to fetch channel");
        }

        const data = await res.json();
        setChannel(data);
        if (data.defaultPlaylistId) {
          setSelectedPlaylist(data.defaultPlaylistId);
        }
      } catch (error) {
        console.error(error);
        setChannel(null);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      getChannel();
    }
  }, [id]);

  async function saveChanges() {
    try {
      setSaving(true);

      await fetch(`/api/channels/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          defaultPlaylistId: selectedPlaylist,
        }),
      });

      alert("Fallback playlist updated");
    } finally {
      setSaving(false);
    }
  }

  const handleCopyKey = () => {
    if (channel?.streamKey) {
      navigator.clipboard.writeText(channel.streamKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#010312] font-mono text-xs text-[#106EE9]">
        <div className="flex items-center gap-2 rounded-xl border border-white/5 bg-[#0B1026] px-5 py-3 shadow-lg">
          <Activity size={16} className="animate-spin text-[#106EE9]" />
          <span className="tracking-widest">CONNECTING TO CHANNEL NODE...</span>
        </div>
      </div>
    );
  }

  if (!channel) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#010312] p-6 text-center text-white">
        <div className="rounded-2xl bg-red-500/10 p-4 border border-red-500/20 text-red-400 mb-4 shadow-lg">
          <Tv size={28} />
        </div>
        <h2 className="text-lg font-bold">Node Communication Failed</h2>
        <p className="mt-1 text-xs text-zinc-400 max-w-sm">
          The requested channel ID does not exist or has been decommissioned.
        </p>
        <Link
          href="/admin/channels"
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#0B1026] px-4 py-2 text-xs font-medium text-white border border-white/10 hover:border-[#106EE9]/40 hover:bg-[#106EE9]/10 transition-all shadow-md"
        >
          <ArrowLeft size={14} /> Return to Directory
        </Link>
      </div>
    );
  }

  const selectedPlaylistData = channel.playlists.find(
    (p) => p.id === selectedPlaylist
  );

  return (
    <div className="min-h-screen bg-[#010312] p-4 sm:p-6 text-white font-sans antialiased">
      <div className="mx-auto max-w-7xl space-y-5">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-4 gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/channels"
              className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-[#0B1026] p-2 text-zinc-400 hover:border-[#106EE9]/50 hover:text-white transition-all shadow-sm"
              title="Back to Channels"
            >
              <ArrowLeft size={18} />
            </Link>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-bold tracking-tight">{channel.name}</h1>
                <span className="rounded-md bg-[#106EE9]/10 border border-[#106EE9]/30 px-2 py-0.5 font-mono text-[11px] font-semibold text-[#106EE9]">
                  ID #{channel.id}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
           
            <button
              onClick={saveChanges}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#106EE9] to-[#400FD3] px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-[#400FD3]/20 hover:opacity-90 active:scale-[0.98] disabled:opacity-50 transition-all cursor-pointer"
            >
              <Save size={14} />
              {saving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </div>

        {/* Hero Banner */}
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0B1026] p-5 sm:p-6 shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-[#010312] shadow-inner">
                {channel.logo ? (
                  <Image
                    src={channel.logo}
                    alt={channel.name}
                    width={64}
                    height={64}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Tv className="h-8 w-8 text-[#106EE9]" />
                )}
              </div>

              <div>
                <h2 className="text-xl font-bold tracking-tight text-white">{channel.name}</h2>
                <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-zinc-400">
                  <span className="flex items-center gap-1.5">
                    <Globe size={13} className="text-zinc-500" />
                    {channel.country || "Global Region"}
                  </span>
                  <span className="text-zinc-700">•</span>
                  <span className="flex items-center gap-1.5 font-mono">
                    <Calendar size={13} className="text-zinc-500" />
                    Registered {new Date(channel.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Ingest Stream Box */}
            <div className="w-full sm:w-auto bg-[#010312]/80 backdrop-blur-md border border-[#106EE9]/30 rounded-xl p-3.5 min-w-[280px]">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-zinc-300 font-medium flex items-center gap-1.5">
                 Stream Key
                </span>
              </div>
              <div className="flex items-center justify-between gap-3 bg-[#0B1026] px-3 py-2 rounded-lg border border-white/5 font-mono text-xs text-[#106EE9]">
                <span className="truncate max-w-[180px] font-semibold">{channel.streamKey}</span>
                <button
                  onClick={handleCopyKey}
                  className="p-1 hover:bg-white/10 rounded-md text-zinc-400 hover:text-white transition-all active:scale-95"
                  title="Copy Stream Key"
                >
                  {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          
          {/* Main Controls */}
          <div className="lg:col-span-2 space-y-5">
            
            {/* Fallback Automation Card */}
            <div className="rounded-2xl border border-white/10 bg-[#0B1026] p-5 space-y-4 shadow-lg">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#106EE9] flex items-center gap-2">
                  <ListVideo size={16} /> 24/7 Fallback Automation
                </h3>
                <span className="text-xs text-zinc-500 font-mono bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
                  {channel.playlists.length} Available
                </span>
              </div>

              <p className="text-xs text-zinc-400 leading-relaxed">
                This playlist will automatically loop on the primary stream whenever no real-time schedule is live.
              </p>

              <div className="space-y-2.5">
                <label className="text-xs font-semibold text-zinc-300">
                  Select Active Fallback
                </label>

                <select
                  value={selectedPlaylist ?? ""}
                  onChange={(e) =>
                    setSelectedPlaylist(
                      e.target.value ? Number(e.target.value) : null
                    )
                  }
                  className="w-full rounded-xl border border-white/10 bg-[#010312] px-3.5 py-2.5 text-xs text-white outline-none focus:border-[#106EE9] focus:ring-1 focus:ring-[#106EE9] transition-all cursor-pointer"
                >
                  <option value="">No fallback playlist assigned</option>
                  {channel.playlists.map((playlist) => (
                    <option key={playlist.id} value={playlist.id}>
                      {playlist.name}
                      {playlist.totalDuration
                        ? ` (${Math.floor(playlist.totalDuration / 60)} min duration)`
                        : ""}
                    </option>
                  ))}
                </select>

                {selectedPlaylistData ? (
                  <div className="flex items-center justify-between rounded-xl border border-[#106EE9]/30 bg-[#106EE9]/10 px-3.5 py-2.5 text-xs">
                    <div className="flex items-center gap-2 text-sky-300 font-medium truncate">
                      <CheckCircle2 size={15} className="text-[#106EE9] shrink-0" />
                      <span className="truncate">Active: <strong className="text-white">{selectedPlaylistData.name}</strong></span>
                    </div>
                    {selectedPlaylistData.totalDuration && (
                      <span className="flex items-center gap-1 font-mono text-xs text-zinc-400 shrink-0 ml-2 bg-black/20 px-2 py-1 rounded border border-white/5">
                        <Clock size={12} />
                        {Math.floor(selectedPlaylistData.totalDuration / 60)}m
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/5 px-3.5 py-2.5 text-xs text-amber-300">
                    <AlertTriangle size={15} className="shrink-0" />
                    <span>Warning: Without a fallback playlist, stream will show blackout when unscheduled.</span>
                  </div>
                )}
              </div>
            </div>

            {/* Channel Description */}
            <div className="rounded-2xl border border-white/10 bg-[#0B1026] p-5 space-y-3 shadow-lg">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Channel Description
              </h3>
              <div className="rounded-xl bg-[#010312] border border-white/5 p-4 text-xs text-zinc-300 leading-relaxed min-h-[90px]">
                {channel.description || (
                  <span className="text-zinc-600 italic">No description provided for this channel.</span>
                )}
              </div>
            </div>

          </div>

          {/* Column 3: Sidebar Telemetry */}
          <div className="space-y-5">
            
            {/* Quick Stats Grid */}
            <div className="rounded-2xl border border-white/10 bg-[#0B1026] p-5 space-y-3 shadow-lg">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#106EE9] flex items-center gap-2">
                <Sliders size={16} /> Channel Overview
              </h3>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between items-center p-2.5 rounded-lg bg-[#010312] border border-white/5">
                  <span className="text-zinc-500">Database ID</span>
                  <span className="text-white font-bold">#{channel.id}</span>
                </div>
                <div className="flex justify-between items-center p-2.5 rounded-lg bg-[#010312] border border-white/5">
                  <span className="text-zinc-500">Country Code</span>
                  <span className="text-white font-bold">{channel.country || "GLOBAL"}</span>
                </div>
                <div className="flex justify-between items-center p-2.5 rounded-lg bg-[#010312] border border-white/5">
                  <span className="text-zinc-500">Bound Playlists</span>
                  <span className="text-[#106EE9] font-bold">{channel.playlists.length} Total</span>
                </div>
              </div>
            </div>

            {/* Health Status */}
            <div className="rounded-2xl border border-white/10 bg-[#0B1026] p-5 space-y-3 shadow-lg">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                <Radio size={16} /> Output Health
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                System telemetry automatically validates fallback loop integrity.
              </p>
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 font-mono flex items-center gap-2.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>PLayout Ready • No Errors</span>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}