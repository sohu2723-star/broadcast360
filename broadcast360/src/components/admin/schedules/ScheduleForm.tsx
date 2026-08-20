"use client";

import { useEffect, useState } from "react";
import { ScheduleFormData } from "@/types/schedule";

type Channel = {
  id: number;
  name: string;
};

type Program = {
  id: number;
  name: string;
};

type Playlist = {
  id: number;
  name: string;
  totalDuration?: number;
};

interface ScheduleFormProps {
  initialData?: ScheduleFormData & {
    id?: number;
    programId?: number;
  };
}

export default function ScheduleForm({ initialData }: ScheduleFormProps) {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);

  const [playlistDuration, setPlaylistDuration] = useState(0);

  const [loadingPrograms, setLoadingPrograms] = useState(false);
  const [loadingPlaylists, setLoadingPlaylists] = useState(false);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [selectedChannelId, setSelectedChannelId] = useState(
    initialData?.channelId ?? 0
  );

  const [selectedProgramId, setSelectedProgramId] = useState(
    initialData?.programId ?? 0
  );

  const [formData, setFormData] = useState<ScheduleFormData>({
    channelId: initialData?.channelId ?? 0,
    playlistId: initialData?.playlistId ?? 0,
    startTime: initialData?.startTime ?? "",
    endTime: initialData?.endTime ?? "",
  });

  const calculateEndTime = (startTime: string, duration: number) => {
    const start = new Date(startTime);

    start.setSeconds(start.getSeconds() + duration);

    const year = start.getFullYear();
    const month = String(start.getMonth() + 1).padStart(2, "0");
    const day = String(start.getDate()).padStart(2, "0");
    const hours = String(start.getHours()).padStart(2, "0");
    const minutes = String(start.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const formatDuration = (seconds: number) => {
    if (!seconds) return "LIVE / Manual";

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return [
      hours ? `${hours}h` : "",
      minutes ? `${minutes}m` : "",
      `${secs}s`,
    ]
      .filter(Boolean)
      .join(" ");
  };

  const getCurrentDateTimeString = () => {
    const now = new Date();
    now.setSeconds(0, 0);

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hour = String(now.getHours()).padStart(2, "0");
    const minute = String(now.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day}T${hour}:${minute}`;
  };

  useEffect(() => {
    fetch("/api/channels?limit=100")
      .then((res) => res.json())
      .then((body) => {
        const list = body?.data ?? body;

        setChannels(Array.isArray(list) ? list : []);
      })
      .catch(() => {
        setError("Failed to load channels");
      });
  }, []);

  useEffect(() => {
    if (!selectedChannelId) {
      setPrograms([]);
      setPlaylists([]);
      return;
    }

    setLoadingPrograms(true);

    fetch(`/api/programs?channelId=${selectedChannelId}`)
      .then((res) => res.json())
      .then((body) => {
        const list = body?.data ?? body;

        setPrograms(Array.isArray(list) ? list : []);
      })
      .finally(() => {
        setLoadingPrograms(false);
      });
  }, [selectedChannelId]);

  useEffect(() => {
    if (!selectedProgramId) {
      setPlaylists([]);
      return;
    }

    setLoadingPlaylists(true);

    fetch(`/api/playlists?programId=${selectedProgramId}`)
      .then((res) => res.json())
      .then((body) => {
        const list = body?.data ?? body;

        setPlaylists(Array.isArray(list) ? list : []);
      })
      .finally(() => {
        setLoadingPlaylists(false);
      });
  }, [selectedProgramId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setError(null);

    if (
      !formData.channelId ||
      !formData.playlistId ||
      !formData.startTime
    ) {
      setError("Please fill all required fields.");
      setLoading(false);
      return;
    }

    // LIVE stream requires manual end time
    if (playlistDuration === 0 && !formData.endTime) {
      setError("End time is required for live stream schedule.");
      setLoading(false);
      return;
    }

    const now = new Date();
    const start = new Date(formData.startTime);

    if (start < now) {
      setError("Schedule cannot start in the past.");
      setLoading(false);
      return;
    }

    if (formData.endTime && new Date(formData.endTime) <= start) {
      setError("End time must be after start time.");
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Failed to save schedule");
      }

      window.location.href = "/admin/schedules";
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unexpected error"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-xl mx-auto p-6 rounded-2xl bg-[#010312] border border-[#4f6689]/20 shadow-2xl backdrop-blur-sm text-white">
      {error && (
        <div className="mb-5 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium tracking-wide">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* CHANNEL */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#4f6689] tracking-wider uppercase">
            Channel
          </label>
          <select
            value={selectedChannelId || ""}
            onChange={(e) => {
              const id = Number(e.target.value);

              setSelectedChannelId(id);
              setSelectedProgramId(0);
              setPlaylistDuration(0);

              setFormData((prev) => ({
                ...prev,
                channelId: id,
                playlistId: 0,
                endTime: "",
              }));
            }}
            className="h-11 w-full rounded-lg border border-[#4f6689]/30 bg-[#010312] px-3.5 text-sm text-white focus:border-[#4f6689] focus:outline-none focus:ring-1 focus:ring-[#4f6689] transition-all"
          >
            <option value="">Select Channel</option>
            {channels.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* PROGRAM */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#4f6689] tracking-wider uppercase">
            Program
          </label>
          <select
            value={selectedProgramId || ""}
            disabled={!selectedChannelId || loadingPrograms}
            onChange={(e) => {
              setSelectedProgramId(Number(e.target.value));

              setPlaylistDuration(0);

              setFormData((prev) => ({
                ...prev,
                playlistId: 0,
                endTime: "",
              }));
            }}
            className="h-11 w-full rounded-lg border border-[#4f6689]/30 bg-[#010312] px-3.5 text-sm text-white focus:border-[#4f6689] focus:outline-none focus:ring-1 focus:ring-[#4f6689] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <option value="">Select Program</option>
            {programs.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* PLAYLIST */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#4f6689] tracking-wider uppercase">
            Playlist
          </label>
          <select
            value={formData.playlistId || ""}
            disabled={!selectedProgramId || loadingPlaylists}
            onChange={async (e) => {
              const playlistId = Number(e.target.value);

              if (!playlistId) {
                setPlaylistDuration(0);

                setFormData((prev) => ({
                  ...prev,
                  playlistId: 0,
                  endTime: "",
                }));

                return;
              }

              const res = await fetch(
                `/api/programs/${selectedProgramId}/playlists/${playlistId}`
              );

              const result = await res.json();

              const duration = result.data.totalDuration ?? 0;

              setPlaylistDuration(duration);

              setFormData((prev) => ({
                ...prev,
                playlistId,

                // VOD auto calculate
                // LIVE keep manual
                endTime:
                  duration > 0 && prev.startTime
                    ? calculateEndTime(prev.startTime, duration)
                    : "",
              }));
            }}
            className="h-11 w-full rounded-lg border border-[#4f6689]/30 bg-[#010312] px-3.5 text-sm text-white focus:border-[#4f6689] focus:outline-none focus:ring-1 focus:ring-[#4f6689] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <option value="">Select Playlist</option>
            {playlists.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          {formData.playlistId > 0 && (
            <p className="text-xs text-[#4f6689]/70 pt-0.5">
              Duration:
              <span className="ml-1.5 font-medium text-white">
                {formatDuration(playlistDuration)}
              </span>
            </p>
          )}
        </div>

        {/* TIME */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-1">
          {/* START TIME */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#4f6689] tracking-wider uppercase">
              Start Time
            </label>
            <input
              type="datetime-local"
              min={getCurrentDateTimeString()}
              value={formData.startTime}
              onChange={(e) => {
                const startTime = e.target.value;

                setFormData((prev) => ({
                  ...prev,
                  startTime,

                  // Only VOD auto calculate
                  // LIVE keeps manual end time
                  endTime:
                    playlistDuration > 0
                      ? calculateEndTime(startTime, playlistDuration)
                      : prev.endTime,
                }));
              }}
              className="h-11 w-full rounded-lg border border-[#4f6689]/30 bg-[#010312] px-3.5 text-sm text-white focus:border-[#4f6689] focus:outline-none focus:ring-1 focus:ring-[#4f6689] transition-all"
            />
          </div>

          {/* END TIME */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#4f6689] tracking-wider uppercase">
              End Time
            </label>
            <input
              type="datetime-local"
              value={formData.endTime}
              readOnly={playlistDuration > 0}
              onChange={(e) => {
                // only LIVE can edit
                if (playlistDuration === 0) {
                  setFormData((prev) => ({
                    ...prev,
                    endTime: e.target.value,
                  }));
                }
              }}
              className={`h-11 w-full rounded-lg border border-[#4f6689]/30 bg-[#010312] px-3.5 text-sm text-white focus:border-[#4f6689] focus:outline-none focus:ring-1 focus:ring-[#4f6689] transition-all ${
                playlistDuration > 0
                  ? "opacity-50 cursor-not-allowed bg-[#010312]/60"
                  : ""
              }`}
            />

            {playlistDuration === 0 && formData.playlistId > 0 && (
              <p className="text-[11px] text-amber-400/90 pt-0.5">
                Live stream: manual end time required
              </p>
            )}
          </div>
        </div>

        {/* SUBMIT */}
        <button
          type="submit"
          disabled={loading || loadingPrograms || loadingPlaylists}
          className="mt-6 h-11 w-full rounded-lg bg-gradient-to-r from-[#4f6689] to-[#400FD3] text-sm font-semibold text-white shadow-lg shadow-[#4f6689]/20 hover:opacity-95 active:scale-[0.99] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
        >
          {loading
            ? "Saving..."
            : initialData?.id
            ? "Update Schedule"
            : "Create Schedule"}
        </button>
      </form>
    </div>
  );
}