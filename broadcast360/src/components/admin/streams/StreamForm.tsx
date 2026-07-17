"use client";

import { useState } from "react";

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

interface Props {
  channels?: Channel[];

  initialData?: StreamFormData;

  onSubmit: (data: StreamFormData) => Promise<void>;

  onCancel?: () => void;

  loading?: boolean;
}

export default function StreamForm({
  channels = [],

  initialData,

  onSubmit,

  onCancel,

  loading = false,
}: Props) {
  const [form, setForm] = useState<StreamFormData>({
    name: initialData?.name ?? "",

    url: initialData?.url ?? "",

    protocol: initialData?.protocol ?? "RTSP",

    channelId: initialData?.channelId ?? 0,

    description: initialData?.description ?? "",
  });

  const [errors, setErrors] = useState<{
    name?: string;

    url?: string;

    channelId?: string;
  }>({});

  function update(key: keyof StreamFormData, value: any) {
    setForm((prev) => ({
      ...prev,

      [key]: value,
    }));

    // remove error when user types

    setErrors((prev) => ({
      ...prev,

      [key]: undefined,
    }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    const newErrors: {
      name?: string;
      url?: string;
      channelId?: string;
    } = {};

    if (!form.name.trim()) {
      newErrors.name = "Stream name is required";
    }

    if (!form.url.trim()) {
      newErrors.url = "Stream URL is required";
    }

    if (form.channelId === 0) {
      newErrors.channelId = "Please select a channel";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    await onSubmit(form);
  }

  return (
    <form
      onSubmit={submit}
      className="
bg-[#0B1026]
border
border-gray-800
rounded-xl
p-6
space-y-5
"
    >
      {/* NAME */}

      <div>
        <label
          className="
text-gray-300
block
mb-2
"
        >
          Stream Name
        </label>

        <input
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
          className={`
w-full
bg-[#010312]
border
${errors.name ? "border-red-500" : "border-gray-700"}
rounded-lg
px-4
py-3
text-white
outline-none
`}
        />

        {errors.name && (
          <p
            className="
text-red-400
text-sm
mt-2
"
          >
            {errors.name}
          </p>
        )}
      </div>

      {/* URL */}

      <div>
        <label
          className="
text-gray-300
block
mb-2
"
        >
          Stream URL
        </label>

        <input
          value={form.url}
          onChange={(e) => update("url", e.target.value)}
          className={`
w-full
bg-[#010312]
border
${errors.url ? "border-red-500" : "border-gray-700"}
rounded-lg
px-4
py-3
text-white
outline-none
`}
          placeholder="
rtsp://camera-ip/live
"
        />

        {errors.url && (
          <p
            className="
text-red-400
text-sm
mt-2
"
          >
            {errors.url}
          </p>
        )}
      </div>

      {/* PROTOCOL */}

      <div>
        <label
          className="
text-gray-300
block
mb-2
"
        >
          Protocol
        </label>

        <select
          value={form.protocol}
          onChange={(e) => update("protocol", e.target.value as StreamProtocol)}
          className="
w-full
bg-[#010312]
border
border-gray-700
rounded-lg
px-4
py-3
text-white
outline-none
"
        >
          <option value="RTSP">RTSP</option>

          <option value="RTMP">RTMP</option>

          <option value="HLS">HLS</option>

          <option value="WEBRTC">WEBRTC</option>
        </select>
      </div>

      {/* CHANNEL */}

      <div>
        <label
          className="
text-gray-300
block
mb-2
"
        >
          Channel
        </label>

        <select
          value={form.channelId}
          onChange={(e) => update("channelId", Number(e.target.value))}
          className={`
w-full
bg-[#010312]
border
${errors.channelId ? "border-red-500" : "border-gray-700"}
rounded-lg
px-4
py-3
text-white
outline-none
`}
        >
          <option value={0}>
            {channels.length === 0 ? "No channels available" : "Select Channel"}
          </option>

          {channels.map((channel) => (
            <option key={channel.id} value={channel.id}>
              {channel.name}
            </option>
          ))}
        </select>

        {errors.channelId && (
          <p
            className="
text-red-400
text-sm
mt-2
"
          >
            {errors.channelId}
          </p>
        )}
      </div>

      {/* DESCRIPTION */}

      <div>
        <label
          className="
text-gray-300
block
mb-2
"
        >
          Description
        </label>

        <textarea
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          className="
w-full
h-28
bg-[#010312]
border
border-gray-700
rounded-lg
px-4
py-3
text-white
outline-none
"
          placeholder="
Optional description
"
        />
      </div>

      {/* BUTTONS */}

      <div
        className="
flex
gap-4
"
      >
        <button
          type="submit"
          disabled={loading}
          className="
flex-[2]
bg-[#106EE9]
hover:opacity-80
text-white
rounded-lg
py-3
font-medium
disabled:opacity-50
"
        >
          {loading ? "Saving..." : "Save Stream"}
        </button>

        <button
          type="button"
          onClick={onCancel}
          className="
flex-1
bg-gray-700
hover:opacity-80
text-white
rounded-lg
py-3
font-medium
"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
