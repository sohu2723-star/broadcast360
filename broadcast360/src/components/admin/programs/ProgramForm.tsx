"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ProgramType } from "@/generated/prisma/client";
import { createProgramSchema } from "@/lib/validators/program.validator";

export default function ProgramForm({
  channels,
}: {
  channels: {
    id: number;
    name: string;
  }[];
}) {
  const router = useRouter();

  const [channelId, setChannelId] = useState("");
  const [title, setTitle] = useState("");
  const [type, setType] = useState<ProgramType>(ProgramType.MOVIE);
  const [description, setDescription] = useState("");

  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function submit() {
    const payload = {
      channelId: Number(channelId),
      title,
      type,
      description,
    };

    const result = createProgramSchema.safeParse(payload);

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;

      setErrors({
        channelId: fieldErrors.channelId?.[0] || "",
        title: fieldErrors.title?.[0] || "",
        type: fieldErrors.type?.[0] || "",
        description: fieldErrors.description?.[0] || "",
      });

      return;
    }

    setErrors({});

    const res = await fetch("/api/programs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        channelId: Number(channelId),
        title,
        type,
        description,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      setMessage("Program created successfully");
      router.push("/admin/programs");
    } else {
      setMessage(data.message);
    }
  }

  return (
    <div className="bg-[#0B1026] p-8 rounded-xl max-w-xl space-y-5">
      <h1 className="text-2xl font-bold">Create Program</h1>

      <select
        value={channelId}
        onChange={(e) => setChannelId(e.target.value)}
        className="w-full p-3 bg-black rounded"
      >
        <option value="">Select Channel</option>

        {channels.map((channel) => (
          <option key={channel.id} value={channel.id}>
            {channel.name}
          </option>
        ))}
      </select>
      {errors.channelId && (
        <p className="text-red-500 text-sm mt-1">{errors.channelId}</p>
      )}

      <input
        placeholder="Program title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full p-3 bg-black rounded"
      />
      {errors.title && (
        <p className="text-red-500 text-sm mt-1">{errors.title}</p>
      )}

      <select
        value={type}
        onChange={(e) => setType(e.target.value as ProgramType)}
        className="w-full p-3 bg-black rounded"
      >
        {Object.values(ProgramType).map((type) => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
      </select>
      {errors.type && (
        <p className="text-red-500 text-sm mt-1">{errors.type}</p>
      )}

      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full p-3 bg-black rounded"
      />
      {errors.description && (
        <p className="text-red-500 text-sm mt-1">{errors.description}</p>
      )}
      <div className="flex gap-4">
        <button onClick={submit} className="bg-blue-600 px-5 py-3 rounded">
          Create
        </button>

        <button
          onClick={() => router.push("/admin/programs")}
          className="bg-[#F41010] px-5 py-3 rounded"
        >
          Cancel
        </button>
      </div>

      {message && <p>{message}</p>}
    </div>
  );
}
