"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ProgramType } from "@/generated/prisma/client";
import { createProgramSchema } from "@/lib/validators/program.validator";
import type { ProgramFormData } from "@/types/program";

type Channel = {
  id: number;
  name: string;
};

type ProgramFormProps = {
  channels: Channel[];

  initialData?: ProgramFormData;

  mode?: "create" | "edit";
};

export default function ProgramForm({
  channels,
  initialData,
  mode = "create",
}: ProgramFormProps) {
  const router = useRouter();

  const [channelId, setChannelId] = useState(
    initialData?.channelId?.toString() || "",
  );

  const [title, setTitle] = useState(initialData?.title || "");

  const [type, setType] = useState<ProgramType>(
    initialData?.type || ProgramType.MOVIE,
  );

  const [description, setDescription] = useState(
    initialData?.description || "",
  );

  const [message, setMessage] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});

  const [loading, setLoading] = useState(false);

  async function submit() {
    const payload = {
      channelId: Number(channelId),

      title: title.trim(),

      type,

      description: description.trim(),
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

    try {
      setLoading(true);

      setErrors({});

      const url =
        mode === "edit" ? `/api/programs/${initialData?.id}` : "/api/programs";

      const method = mode === "edit" ? "PUT" : "POST";

      const res = await fetch(url, {
        method,

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(result.data),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setMessage(
          mode === "edit"
            ? "Program updated successfully"
            : "Program created successfully",
        );

        router.push("/admin/programs");
      } else {
        const fieldErrors = data.errors || {};
        const nextErrors: Record<string, string> = {
          channelId: Array.isArray(fieldErrors.channelId) ? fieldErrors.channelId[0] || "" : "",
          title: Array.isArray(fieldErrors.title) ? fieldErrors.title[0] || "" : "",
          type: Array.isArray(fieldErrors.type) ? fieldErrors.type[0] || "" : "",
          description: Array.isArray(fieldErrors.description) ? fieldErrors.description[0] || "" : "",
        };
        setErrors(nextErrors);
        setMessage(
          data.message ||
            Object.values(nextErrors).find(Boolean) ||
            "Unable to save program",
        );
      }
    } catch (error) {
      console.log(error);

      setMessage("Server error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl space-y-5 rounded-xl bg-[#0B1026] p-8">
      <h1 className="text-2xl font-bold">
        {mode === "edit" ? "Edit Program" : "Create Program"}
      </h1>

      <select
        value={channelId}

        onChange={(e) => {
          setChannelId(e.target.value);
          setErrors((prev) => ({ ...prev, channelId: "" }));
          setMessage("");
        }}

        className="w-full rounded bg-black p-3"
      >
        <option value="">Select Channel</option>

        {channels.map((channel) => (
          <option key={channel.id} value={channel.id}>
            {channel.name}
          </option>
        ))}
      </select>

      {errors.channelId && (
        <p className="text-sm text-red-500">{errors.channelId}</p>
      )}

      <input
        placeholder="Program title"

        value={title}

        onChange={(e) => {
          setTitle(e.target.value);
          setErrors((prev) => ({ ...prev, title: "" }));
          setMessage("");
        }}

        className="w-full rounded bg-black p-3"
      />

      {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}

      <select
        value={type}

        onChange={(e) => {
          setType(e.target.value as ProgramType);
          setErrors((prev) => ({ ...prev, type: "" }));
          setMessage("");
        }}

        className="w-full rounded bg-black p-3"
      >
        {Object.values(ProgramType).map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>

      {errors.type && <p className="text-sm text-red-500">{errors.type}</p>}

      <textarea
        placeholder="Description"

        value={description}

        onChange={(e) => {
          setDescription(e.target.value);
          setErrors((prev) => ({ ...prev, description: "" }));
          setMessage("");
        }}

        className="w-full rounded bg-black p-3"
      />

      {errors.description && (
        <p className="text-sm text-red-500">{errors.description}</p>
      )}

      <div className="flex gap-4">
        <button
          disabled={loading}

          type="button"
          onClick={submit}

          className="rounded bg-[#4f6689] px-5 py-3"
        >
          {loading ? "Saving..." : mode === "edit" ? "Update" : "Create"}
        </button>

        <button
          type="button"
          onClick={() => router.push("/admin/programs")}

          className="rounded bg-[#F41010] px-5 py-3"
        >
          Cancel
        </button>
      </div>

      {message && <p>{message}</p>}
    </div>
  );
}
