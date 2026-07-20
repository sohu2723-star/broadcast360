"use client";

import { useEffect, useState } from "react";
import { ScheduleFormData } from "@/types/schedule";

type Channel = { id: number; name: string };
type Program = { id: number; name: string };
type Playlist = { id: number; name: string };

interface ScheduleFormProps {
  initialData?: ScheduleFormData & { id?: number; programId?: number };
}

export default function ScheduleForm({ initialData }: ScheduleFormProps) {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);

  const [loadingPrograms, setLoadingPrograms] = useState(false);
  const [loadingPlaylists, setLoadingPlaylists] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper to get current time formatted for datetime-local input (YYYY-MM-DDTHH:MM)
  const getCurrentDateTimeString = () => {
    const now = new Date();
    now.setSeconds(0, 0);
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Structural Form selections tracking matching your schema layout
  const [selectedChannelId, setSelectedChannelId] = useState<number>(
    initialData?.channelId ?? 0,
  );
  const [selectedProgramId, setSelectedProgramId] = useState<number>(
    initialData?.programId ?? 0,
  );

  const [formData, setFormData] = useState<ScheduleFormData>({
    channelId: initialData?.channelId ?? 0,
    playlistId: initialData?.playlistId ?? 0,
    startTime: initialData?.startTime ?? "",
    endTime: initialData?.endTime ?? "",
  });

  // 1. Fetch initial channel records
  useEffect(() => {
    fetch("/api/channels?limit=100")
      .then((res) => res.json())
      .then((resBody) => {
        const list = resBody?.data ? resBody.data : resBody;
        setChannels(Array.isArray(list) ? list : []);
      })
      .catch(() => setError("Failed to initialize channels."));
  }, []);

  // 2. Fetch programs via exact channelId relation
  useEffect(() => {
    if (!selectedChannelId) {
      setPrograms([]);
      setPlaylists([]);
      setSelectedProgramId(0);
      return;
    }

    setLoadingPrograms(true);
    fetch(`/api/programs?channelId=${selectedChannelId}`)
      .then((res) => res.json())
      .then((resBody) => {
        const list = resBody?.data ? resBody.data : resBody;
        setPrograms(Array.isArray(list) ? list : []);

        // Reset downward choices if changing active channel tracking parameters manually
        if (selectedChannelId !== initialData?.channelId) {
          setSelectedProgramId(0);
          setPlaylists([]);
          setFormData((prev) => ({ ...prev, playlistId: 0 }));
        }
      })
      .catch(() => setError("Failed to map programs for this channel."))
      .finally(() => setLoadingPrograms(false));
  }, [selectedChannelId, initialData?.channelId]);

  // 3. Fetch playlists via dynamic program route parameters
  useEffect(() => {
    if (!selectedProgramId) {
      setPlaylists([]);
      setFormData((prev) => ({ ...prev, playlistId: 0 }));
      return;
    }

    setLoadingPlaylists(true);
    fetch(`/api/playlists?programId=${selectedProgramId}`)
      .then((res) => res.json())
      .then((resBody) => {
        const list = resBody?.data ? resBody.data : resBody;
        setPlaylists(Array.isArray(list) ? list : []);

        if (selectedProgramId !== initialData?.programId) {
          setFormData((prev) => ({ ...prev, playlistId: 0 }));
        }
      })
      .catch(() => setError("Failed to fetch playlists for this program."))
      .finally(() => setLoadingPlaylists(false));
  }, [selectedProgramId, initialData?.programId]);

  

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // 1. Check for empty fields first
    if (
      !formData.channelId ||
      !formData.playlistId ||
      !formData.startTime ||
      !formData.endTime
    ) {
      setError("Please fill out all operational scheduling fields.");
      setLoading(false);
      return;
    }

    // 👇 2. PLACE THE REAL-TIME VALIDATION HERE 👇
    const now = new Date();
    now.setSeconds(0, 0); // Clear seconds/milliseconds so current minute works

    const selectedStart = new Date(formData.startTime);
    const selectedEnd = new Date(formData.endTime);

    if (selectedStart < now) {
      setError("Broadcast schedules cannot be created in the past.");
      setLoading(false);
      return;
    }

    if (selectedEnd <= selectedStart) {
      setError("Playout end time must occur after the start time.");
      setLoading(false);
      return;
    }

    try {
      const endpoint = initialData?.id
        ? `/api/schedules/${initialData.id}`
        : "/api/schedules";
      const method = initialData?.id ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await res.json();
      if (!res.ok)
        throw new Error(
          result.message || "Failed to finalize schedule save action.",
        );

      window.location.href = "/admin/schedules";
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An unexpected execution error occurred.",
      );
    } finally {
      setLoading(false);
    }
  }

  {
    return (
      <div className="max-w-xl mx-auto bg-[#0B1026] border border-[#106EE9]/20 rounded-xl shadow-2xl shadow-[#010312]/50 p-6 sm:p-8 text-[#FFFFFF]">
        {/* HEADER SECTION */}
        <div className="mb-6 border-b border-[#106EE9]/10 pb-4">
          <h2 className="text-xl font-semibold tracking-wide text-[#FFFFFF]">
            {initialData?.id
              ? "Modify Production Schedule"
              : "Create Broadcast Schedule"}
          </h2>
          <p className="text-sm text-[#106EE9]/70 mt-1">
            Configure paths dynamically using robust database relational keys.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* ERROR DISPATCH */}
          {error && (
            <div className="p-3 bg-[#F41010]/10 border border-[#F41010] text-sm text-[#F41010] rounded-lg font-medium flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F41010] animate-pulse" />
              {error}
            </div>
          )}

          {/* 1. CHANNEL SELECT */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#106EE9]/80">
              1. Target Channel
            </label>
            <select
              value={selectedChannelId || ""}
              onChange={(e) => {
                const cid = Number(e.target.value);
                setSelectedChannelId(cid);
                setFormData((prev) => ({ ...prev, channelId: cid }));
              }}
              className="w-full h-10 px-3 bg-[#010312] border border-[#106EE9]/30 text-[#FFFFFF] rounded-lg focus:outline-none focus:border-[#106EE9] focus:ring-2 focus:ring-[#106EE9]/20 transition-all text-sm cursor-pointer"
            >
              <option value="" className="bg-[#0B1026]">
                Select Channel Target
              </option>
              {channels.map((c) => (
                <option key={c.id} value={c.id} className="bg-[#0B1026]">
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* 2. PROGRAM SELECT */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#106EE9]/80 flex items-center justify-between">
              <span>2. Linked Program</span>
              {loadingPrograms && (
                <span className="text-[#1CFE10] text-[10px] uppercase font-bold tracking-widest animate-pulse flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-[#1CFE10]" />{" "}
                  Fetching...
                </span>
              )}
            </label>
            <select
              value={selectedProgramId || ""}
              disabled={!selectedChannelId || loadingPrograms}
              onChange={(e) => setSelectedProgramId(Number(e.target.value))}
              className="w-full h-10 px-3 bg-[#010312] border border-[#106EE9]/30 text-[#FFFFFF] rounded-lg focus:outline-none focus:border-[#106EE9] focus:ring-2 focus:ring-[#106EE9]/20 transition-all text-sm disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <option value="" className="bg-[#0B1026]">
                {!selectedChannelId
                  ? "Select a channel first"
                  : "Select Program"}
              </option>
              {programs.map((p) => (
                <option key={p.id} value={p.id} className="bg-[#0B1026]">
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* 3. PLAYLIST SELECT */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#106EE9]/80 flex items-center justify-between">
              <span>3. Source Playlist</span>
              {loadingPlaylists && (
                <span className="text-[#1CFE10] text-[10px] uppercase font-bold tracking-widest animate-pulse flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-[#1CFE10]" />{" "}
                  Fetching...
                </span>
              )}
            </label>
            <select
              value={formData.playlistId || ""}
              disabled={!selectedProgramId || loadingPlaylists}
              onChange={(e) =>
                setFormData({ ...formData, playlistId: Number(e.target.value) })
              }
              className="w-full h-10 px-3 bg-[#010312] border border-[#106EE9]/30 text-[#FFFFFF] rounded-lg focus:outline-none focus:border-[#106EE9] focus:ring-2 focus:ring-[#106EE9]/20 transition-all text-sm disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <option value="" className="bg-[#0B1026]">
                {!selectedProgramId
                  ? "Select a program first"
                  : "Select Playlist Assets"}
              </option>
              {playlists.map((p) => (
                <option key={p.id} value={p.id} className="bg-[#0B1026]">
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* TIME WINDOWS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#106EE9]/80">
                Start Time
              </label>
              <input
                type="datetime-local"
                min={getCurrentDateTimeString()}
                value={formData.startTime}
                onChange={(e) =>
                  setFormData({ ...formData, startTime: e.target.value })
                }
                className="w-full h-10 px-3 bg-[#010312] border border-[#106EE9]/30 text-[#FFFFFF] rounded-lg focus:outline-none focus:border-[#106EE9] focus:ring-2 focus:ring-[#106EE9]/20 transition-all text-sm custom-datetime-picker"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#106EE9]/80">
                End Time
              </label>
              <input
                type="datetime-local"
                min={formData.startTime || getCurrentDateTimeString()}
                value={formData.endTime}
                onChange={(e) =>
                  setFormData({ ...formData, endTime: e.target.value })
                }
                className="w-full h-10 px-3 bg-[#010312] border border-[#106EE9]/30 text-[#FFFFFF] rounded-lg focus:outline-none focus:border-[#106EE9] focus:ring-2 focus:ring-[#106EE9]/20 transition-all text-sm custom-datetime-picker"
              />
            </div>
          </div>

          {/* SUBMIT ACTION BUTTON */}
          <button
            type="submit"
            disabled={loading || loadingPrograms || loadingPlaylists}
            className="w-full h-11 mt-4 bg-gradient-to-r from-[#106EE9] to-[#400FD3] hover:from-[#1b79f7] hover:to-[#4e1ce6] text-[#FFFFFF] font-semibold tracking-wide transition-all rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0B1026] focus:ring-[#106EE9] text-sm disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-[#400FD3]/20 active:scale-[0.99]"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing Write Request...
              </span>
            ) : initialData?.id ? (
              "Update Playout Window"
            ) : (
              "Commit Broadcast Window"
            )}
          </button>
        </form>
      </div>
    );
  }
}
