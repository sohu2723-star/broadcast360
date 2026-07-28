"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import {
  createEpisodeSchema,
  editEpisodeSchema,
} from "@/lib/validators/episode.validator";

import type { EpisodeFormData } from "@/types/episode";
import ImageUploader from "@/components/ImageUploader";

type Props = {
  defaultValues?: {
    title?: string;
    episodeNo?: number;
    videoUrl?: string;
    thumbnailUrl?: string;
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

  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(
    defaultValues?.videoUrl ?? null,
  );

  const [form, setForm] = useState<EpisodeFormData>({
    title: defaultValues?.title ?? "",
    episodeNo: defaultValues?.episodeNo ?? 1,
    videoFile: null,
    thumbnailFile: null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    return () => {
      if (videoPreviewUrl && videoPreviewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(videoPreviewUrl);
      }
    };
  }, [videoPreviewUrl]);

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

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;

    setForm({
      ...form,
      videoFile: file,
    });

    if (videoPreviewUrl && videoPreviewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(videoPreviewUrl);
    }

    if (file) {
      const url = URL.createObjectURL(file);
      setVideoPreviewUrl(url);
    } else {
      setVideoPreviewUrl(defaultValues?.videoUrl ?? null);
    }

    if (errors.videoFile) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.videoFile;
        return newErrors;
      });
    }
  };

  return (
    <div className="w-full rounded-2xl border border-white/10 bg-[#0B1026] p-8 text-white">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* LEFT AND RIGHT GRID LAYOUT */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* LEFT SIDE: INPUTS & VIDEO PREVIEW UNDER INPUT */}
          <div className="space-y-5">
            {/* TITLE */}
            <div>
              <label className="mb-2 block font-medium">Episode Title</label>
              <input
                value={form.title}
                placeholder="Enter title"
                className="w-full rounded-xl border border-white/10 bg-[#111936] p-3 text-white focus:border-blue-500 focus:outline-none"
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-500">{errors.title}</p>
              )}
            </div>

            {/* EPISODE NO */}
            <div>
              <label className="mb-2 block font-medium">Episode Number</label>
              <input
                type="number"
                min={1}
                value={form.episodeNo}
                className="w-full rounded-xl border border-white/10 bg-[#111936] p-3 text-white focus:border-blue-500 focus:outline-none"
                onChange={(e) =>
                  setForm({
                    ...form,
                    episodeNo: Number(e.target.value) || 1,
                  })
                }
              />
              {errors.episodeNo && (
                <p className="mt-1 text-sm text-red-500">{errors.episodeNo}</p>
              )}
            </div>

            {/* VIDEO FILE W/ PREVIEW UNDERNEATH */}
            <div>
              <label className="mb-2 block font-medium">Video File</label>
              <input
                type="file"
                accept="video/*"
                className="w-full rounded-xl border border-white/10 bg-[#111936] p-3 text-white file:mr-4 file:rounded-lg file:border-0 file:bg-white/10 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-white hover:file:bg-white/20 focus:border-blue-500 focus:outline-none"
                onChange={handleVideoChange}
              />
              {errors.videoFile && (
                <p className="mt-1 text-sm text-red-500">{errors.videoFile}</p>
              )}

              {/* VIDEO PREVIEW AREA (SHOWS UNDER VIDEO FILE INPUT) */}
              {videoPreviewUrl && (
                <div className="mt-4 overflow-hidden rounded-xl border border-white/10 bg-[#111936] p-2">
                  <p className="mb-2 text-xs font-semibold text-gray-400">
                    Video Preview
                  </p>
                  <video
                    src={videoPreviewUrl}
                    controls
                    className="aspect-video w-full rounded-lg object-contain"
                  />
                  {form.videoFile && (
                    <p className="mt-2 truncate px-2 text-center text-xs text-gray-400">
                      {form.videoFile.name}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT SIDE: THUMBNAIL UPLOADER */}
          <div className="flex flex-col">
            <ImageUploader
              label="Thumbnail Image"
              type="LANDSCAPE"
              value={defaultValues?.thumbnailUrl}
              onChange={(file) => {
                setForm({
                  ...form,
                  thumbnailFile: file,
                });

                if (errors.thumbnailFile) {
                  setErrors((prev) => {
                    const newErrors = { ...prev };
                    delete newErrors.thumbnailFile;
                    return newErrors;
                  });
                }
              }}
            />
            {errors.thumbnailFile && (
              <p className="mt-2 text-sm text-red-500">
                {errors.thumbnailFile}
              </p>
            )}
          </div>
        </div>

        {/* BUTTONS (BOTTOM) */}
        <div className="flex gap-4 border-t border-white/10 pt-4">
          <button
            type="submit"
            className="flex-1 rounded-xl bg-[#106EE9] py-3 font-bold text-white transition hover:opacity-80"
          >
            {isEdit ? "Update Episode" : "Save Episode"}
          </button>

          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-xl bg-[#F41010] px-6 py-3 font-bold text-white transition hover:opacity-80"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
