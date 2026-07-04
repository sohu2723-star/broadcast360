"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  createEpisodeSchema,
  editEpisodeSchema,
} from "@/lib/validators/episode.validator";

import type { EpisodeFormData } from "@/types/episode";

type Props = {
  defaultValues?: {
    title?: string;
    episodeNo?: number;
  };

  isEdit?: boolean;

  onSubmit: (data: EpisodeFormData) => Promise<void>;
};

export default function EpisodeForm({
  defaultValues,
  isEdit = false,
  onSubmit,
}: Props) {
  const router = useRouter();

  const [form, setForm] = useState<EpisodeFormData>({
    title: defaultValues?.title ?? "",
    episodeNo: defaultValues?.episodeNo ?? 1,
    videoFile: null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

  const schema = isEdit ? editEpisodeSchema : createEpisodeSchema;

    const result = schema.safeParse(form);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};

      result.error.issues.forEach((issue) => {
        const field = issue.path[0];
        if (typeof field === "string") {
          fieldErrors[field] = issue.message;
        }
      });

      setErrors(fieldErrors);
      return;
    }

    setErrors({});

    await onSubmit(result.data as EpisodeFormData);
  }

  return (
    <div className="max-w-3xl rounded-2xl border border-white/10 bg-[#0B1026] p-8">
      <form onSubmit={handleSubmit} className="space-y-5">

        {/* TITLE */}
        <div>
          <label className="mb-2 block">Episode Title</label>

          <input
            value={form.title}
            className="w-full rounded-xl border border-white/10 bg-[#111936] p-3"
            onChange={(e) =>
              setForm({ ...form, title: e.target.value })
            }
          />

          {errors.title && (
            <p className="mt-1 text-sm text-red-500">
              {errors.title}
            </p>
          )}
        </div>

        {/* EPISODE NO */}
        <div>
          <label className="mb-2 block">Episode Number</label>

          <input
            type="number"
            min={1}
            value={form.episodeNo}
            className="w-full rounded-xl border border-white/10 bg-[#111936] p-3"
            onChange={(e) =>
              setForm({
                ...form,
                episodeNo: Number(e.target.value) || 1,
              })
            }
          />

          {errors.episodeNo && (
            <p className="mt-1 text-sm text-red-500">
              {errors.episodeNo}
            </p>
          )}
        </div>

        {/* VIDEO */}
        <div>
          <label className="mb-2 block">Video File</label>

          <input
            type="file"
            accept="video/*"
            className="w-full rounded-xl border border-white/10 bg-[#111936] p-3"
            onChange={(e) =>
              setForm({
                ...form,
                videoFile: e.target.files?.[0] ?? null,
              })
            }
          />

          {errors.videoFile && (
            <p className="mt-1 text-sm text-red-500">
              {errors.videoFile}
            </p>
          )}
        </div>

        {/* BUTTONS */}
        <div className="flex gap-4 pt-4">
          <button className="flex-1 rounded-xl bg-[#106EE9] py-3 font-bold">
            Save Episode
          </button>

          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-xl bg-[#F41010] px-6 py-3 font-bold"
          >
            Cancel
          </button>
        </div>

      </form>
    </div>
  );
}