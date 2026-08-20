"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Channel = {
  id: number;
  name: string;
};

type StreamProtocol = "RTSP" | "RTMP" | "HLS" | "WEBRTC";

type StreamFormData = {
  name: string;
  url: string;
  protocol: StreamProtocol;
  channelId: number;
  description?: string;
};

type StreamFormProps = {
  channels?: Channel[];
  initialData?: Partial<StreamFormData>;
  onSubmit?: (data: StreamFormData) => Promise<void> | void;
  onCancel?: () => void;
  loading?: boolean;
};

export default function StreamForm({
  channels: providedChannels,
  initialData,
  onSubmit: submitOverride,
  onCancel,
  loading: externalLoading,
}: StreamFormProps = {}) {
  const router = useRouter();

  const [loadedChannels, setLoadedChannels] = useState<Channel[]>([]);
  const [loadingChannels, setLoadingChannels] = useState(!providedChannels);
  const [internalLoading, setInternalLoading] = useState(false);
  const channels = providedChannels ?? loadedChannels;
  const isLoading = externalLoading ?? internalLoading;

  const [form, setForm] = useState<StreamFormData>({
    name: initialData?.name ?? "",
    url: initialData?.url ?? "",
    protocol: initialData?.protocol ?? "RTSP",
    channelId: initialData?.channelId ?? 0,
    description: initialData?.description ?? "",
  });

  useEffect(() => {
    if (!initialData) return;
    setForm((current) => ({
      ...current,
      ...initialData,
      protocol: initialData.protocol ?? current.protocol,
      channelId: initialData.channelId ?? current.channelId,
    }));
  }, [initialData]);

  const [errors, setErrors] = useState<{
    name?: string;
    url?: string;
    channelId?: string;
  }>({});

  /*
   * ==========================================================
   * LOAD CHANNELS
   * ==========================================================
   */

  useEffect(() => {
    async function loadChannels() {
      try {
        const response = await fetch("/api/channels", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to load channels");
        }

        const json = await response.json();

        console.log("CHANNEL RESPONSE:", json);

        /*
         * Supports:
         *
         * {
         *   data: [...]
         * }
         *
         * or
         *
         * [...]
         */

        setLoadedChannels(json.data ?? json ?? []);
      } catch (error) {
        console.error("❌ Load channels error:", error);
      } finally {
        setLoadingChannels(false);
      }
    }

    if (!providedChannels) {
      loadChannels();
    } else {
      setLoadingChannels(false);
    }
  }, [providedChannels]);

  /*
   * ==========================================================
   * UPDATE FORM
   * ==========================================================
   */

  function update(
    key: keyof StreamFormData,
    value: string | number | StreamProtocol
  ) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [key]: undefined,
    }));
  }

  /*
   * ==========================================================
   * PROTOCOL PLACEHOLDER
   * ==========================================================
   */

  function getUrlPlaceholder() {
    switch (form.protocol) {
      case "RTSP":
        return "rtsp://192.168.1.100:8554/live/streamkey";

      case "RTMP":
        return "rtmp://127.0.0.1:1935/live/streamkey";

      case "HLS":
        return "http://127.0.0.1:8888/live/streamkey/index.m3u8";

      case "WEBRTC":
        return "http://127.0.0.1:8889/live/streamkey/whep";

      default:
        return "Enter stream URL";
    }
  }

  /*
   * ==========================================================
   * PROTOCOL HELP
   * ==========================================================
   */

  function getProtocolHelp() {
    switch (form.protocol) {
      case "RTSP":
        return "Enter the RTSP source URL from Larix, camera, or another RTSP source.";

      case "RTMP":
        return "Enter the RTMP publishing/input URL used by OBS or another RTMP source.";

      case "HLS":
        return "Enter the HLS playlist URL if this stream is already available as HLS.";

      case "WEBRTC":
        return "Enter the WebRTC endpoint if this stream is provided through WebRTC.";

      default:
        return "";
    }
  }

  /*
   * ==========================================================
   * VALIDATE URL
   * ==========================================================
   */

  function validateUrl(url: string) {
    try {
      const parsed = new URL(url);

      if (!["rtsp:", "rtmp:", "http:", "https:"].includes(parsed.protocol)) {
        return false;
      }

      return true;
    } catch {
      return false;
    }
  }

  /*
   * ==========================================================
   * SUBMIT
   * ==========================================================
   */

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    const newErrors: {
      name?: string;
      url?: string;
      channelId?: string;
    } = {};

    /*
     * NAME
     */

    if (!form.name.trim()) {
      newErrors.name = "Stream name is required";
    }

    /*
     * URL
     */

    if (!form.url.trim()) {
      newErrors.url = "Stream URL is required";
    } else if (!validateUrl(form.url.trim())) {
      newErrors.url = "Please enter a valid stream URL";
    }

    /*
     * CHANNEL
     */

    if (!form.channelId || form.channelId === 0) {
      newErrors.channelId = "Please select a channel";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    try {
      if (submitOverride) {
        await submitOverride({
          ...form,
          name: form.name.trim(),
          url: form.url.trim(),
          description: form.description?.trim() || "",
        });
        return;
      }

      setInternalLoading(true);

      const response = await fetch("/api/streams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          url: form.url.trim(),
          protocol: form.protocol,
          channelId: form.channelId,
          description: form.description?.trim() || null,
        }),
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error || "Failed to create stream");
      }

      router.push("/admin/streams");
      router.refresh();
    } catch (error) {
      console.error("Create stream error:", error);
      alert(error instanceof Error ? error.message : "Failed to save stream");
    } finally {
      setInternalLoading(false);
    }
  }

  /*
   * ==========================================================
   * UI
   * ==========================================================
   */

  return (
    <div className="min-h-screen bg-[#050816] p-6">
      <div className="mx-auto max-w-3xl">
        {/* HEADER */}

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">
            Create Stream
          </h1>

          <p className="mt-1 text-sm text-gray-400">
            Add an RTSP, RTMP, HLS, or WebRTC source to a channel.
          </p>
        </div>

        {/* FORM */}

        <form
          onSubmit={submit}
          className="space-y-6 rounded-xl border border-gray-800 bg-[#0B1026] p-6"
        >
          {/* ==================================================
              STREAM NAME
          ================================================== */}

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">
              Stream Name
            </label>

            <input
              value={form.name}
              onChange={(e) =>
                update("name", e.target.value)
              }
              placeholder="Larix Camera"
              className={`w-full rounded-lg border ${
                errors.name
                  ? "border-red-500"
                  : "border-gray-700"
              } bg-[#010312] px-4 py-3 text-white outline-none focus:border-blue-500`}
            />

            {errors.name && (
              <p className="mt-2 text-sm text-red-400">
                {errors.name}
              </p>
            )}
          </div>

          {/* ==================================================
              PROTOCOL
          ================================================== */}

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">
              Protocol
            </label>

            <select
              value={form.protocol}
              onChange={(e) =>
                update(
                  "protocol",
                  e.target.value as StreamProtocol
                )
              }
              className="w-full rounded-lg border border-gray-700 bg-[#010312] px-4 py-3 text-white outline-none focus:border-blue-500"
            >
              <option value="RTSP">RTSP</option>
              <option value="RTMP">RTMP</option>
              <option value="HLS">HLS</option>
              <option value="WEBRTC">WEBRTC</option>
            </select>

            <p className="mt-2 text-xs text-gray-500">
              {getProtocolHelp()}
            </p>
          </div>

          {/* ==================================================
              SOURCE URL
          ================================================== */}

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">
              Source URL
            </label>

            <input
              type="text"
              value={form.url}
              onChange={(e) =>
                update("url", e.target.value)
              }
              placeholder={getUrlPlaceholder()}
              className={`w-full rounded-lg border ${
                errors.url
                  ? "border-red-500"
                  : "border-gray-700"
              } bg-[#010312] px-4 py-3 font-mono text-sm text-white outline-none focus:border-blue-500`}
            />

            {errors.url && (
              <p className="mt-2 text-sm text-red-400">
                {errors.url}
              </p>
            )}

            {/* RTSP HELP */}

            {form.protocol === "RTSP" && (
              <div className="mt-3 rounded-lg border border-gray-800 bg-black/30 p-3">
                <p className="text-xs font-semibold text-gray-300">
                  Example
                </p>

                <p className="mt-1 break-all font-mono text-xs text-gray-500">
                  rtsp://192.168.1.100:8554/live/streamkey
                </p>
              </div>
            )}

            {/* RTMP HELP */}

            {form.protocol === "RTMP" && (
              <div className="mt-3 rounded-lg border border-gray-800 bg-black/30 p-3">
                <p className="text-xs font-semibold text-gray-300">
                  Example
                </p>

                <p className="mt-1 break-all font-mono text-xs text-gray-500">
                  rtmp://127.0.0.1:1935/live/streamkey
                </p>
              </div>
            )}
          </div>

          {/* ==================================================
              CHANNEL
          ================================================== */}

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">
              Channel
            </label>

            <select
              value={form.channelId}
              onChange={(e) =>
                update(
                  "channelId",
                  Number(e.target.value)
                )
              }
              disabled={loadingChannels || isLoading}
              className={`w-full rounded-lg border ${
                errors.channelId
                  ? "border-red-500"
                  : "border-gray-700"
              } bg-[#010312] px-4 py-3 text-white outline-none focus:border-blue-500 disabled:opacity-50`}
            >
              <option value={0}>
                {loadingChannels
                  ? "Loading channels..."
                  : channels.length === 0
                  ? "No channels available"
                  : "Select Channel"}
              </option>

              {channels.map((channel) => (
                <option
                  key={channel.id}
                  value={channel.id}
                >
                  {channel.name}
                </option>
              ))}
            </select>

            {errors.channelId && (
              <p className="mt-2 text-sm text-red-400">
                {errors.channelId}
              </p>
            )}
          </div>

          {/* ==================================================
              DESCRIPTION
          ================================================== */}

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">
              Description
            </label>

            <textarea
              value={form.description}
              onChange={(e) =>
                update(
                  "description",
                  e.target.value
                )
              }
              placeholder="Optional description"
              className="h-28 w-full rounded-lg border border-gray-700 bg-[#010312] px-4 py-3 text-white outline-none focus:border-blue-500"
            />
          </div>

          {/* ==================================================
              ARCHITECTURE INFO
          ================================================== */}

          <div className="rounded-lg border border-blue-900/50 bg-blue-950/20 p-4">
            <p className="mb-2 text-sm font-semibold text-blue-300">
              Broadcast Pipeline
            </p>

            <div className="space-y-1 font-mono text-xs text-gray-400">
              <p>
                {form.protocol || "SOURCE"} → Input
              </p>

              <p>
                ↓
              </p>

              <p>
                MediaMTX source/{"{streamKey}"}
              </p>

              <p>
                ↓
              </p>

              <p>
                Broadcast / Relay
              </p>

              <p>
                ↓
              </p>

              <p>
                MediaMTX channel/{"{streamKey}"}
              </p>

              <p>
                ↓
              </p>

              <p>
                HLS / WebRTC → Viewer
              </p>
            </div>
          </div>

          {/* ==================================================
              BUTTONS
          ================================================== */}

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-[2] rounded-lg bg-[#4f6689] py-3 font-medium text-white hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading
                ? "Saving..."
                : "Save Stream"}
            </button>

            <button
              type="button"
              onClick={() => onCancel?.() ?? router.push("/admin/streams")}
              disabled={isLoading}
              className="flex-1 rounded-lg bg-gray-700 py-3 font-medium text-white hover:opacity-80 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}