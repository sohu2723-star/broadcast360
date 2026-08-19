"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { SeriesFormData } from "@/types/serie";
import ImageUploader from "@/components/ImageUploader";
import { GENRES } from "@/lib/constants/genres";
import {
  createSeriesSchema,
  editSeriesSchema,
} from "@/lib/validators/serie.validator";

type Props = {
  initialData?: SeriesFormData;
  seriesId?: number;
  thumbnailUrl?: string | null;
  onSubmit: (data: SeriesFormData) => Promise<void>;
};

export default function SeriesForm({
  initialData,
  seriesId,
  thumbnailUrl,
  onSubmit,
}: Props) {
  const router = useRouter();
  const [form, setForm] = useState<SeriesFormData>(
    initialData ?? {
      title: "",
      description: "",
      genre: "",
      releaseYear: "",
      thumbnail: null,
    },
  );
  const [fileName, setFileName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{
    title?: string;
    description?: string;
    genre?: string;
    releaseYear?: string;
    thumbnail?: string;
  }>({});

  const isEditMode = !!seriesId;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const schema = isEditMode ? editSeriesSchema : createSeriesSchema;

    const result = schema.safeParse(form);

    if (!result.success) {
      const fieldErrors: typeof errors = {};

      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof typeof errors;

        if (!fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
      });

      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      await onSubmit({
        ...result.data,
        thumbnail: result.data.thumbnail ?? null,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-6xl rounded-2xl border border-white/10 bg-[#0B1026] p-8 text-white">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* LEFT AND RIGHT GRID LAYOUT */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* LEFT SIDE: FORM FIELDS */}
          <div className="space-y-5">
            {/* TITLE */}
            <div>
              <label className="mb-2 block font-medium">Series Title</label>
              <input
                maxLength={100}
                value={form.title}
                onChange={(e) => {
                  setForm({ ...form, title: e.target.value });
                  if (errors.title) setErrors({ ...errors, title: undefined });
                }}
                className={`w-full rounded-xl border bg-[#111936] p-3 text-white focus:outline-none ${
                  errors.title
                    ? "border-red-500"
                    : "border-white/10 focus:border-blue-500"
                }`}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-500">{errors.title}</p>
              )}
            </div>

            {/* DESCRIPTION */}
            <div>
              <label className="mb-2 block font-medium">Description</label>
              <textarea
                rows={4}
                maxLength={1000}
                value={form.description}
                onChange={(e) => {
                  setForm({ ...form, description: e.target.value });
                  if (errors.description)
                    setErrors({ ...errors, description: undefined });
                }}
                className={`w-full rounded-xl border bg-[#111936] p-3 text-white focus:outline-none ${
                  errors.description
                    ? "border-red-500"
                    : "border-white/10 focus:border-blue-500"
                }`}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.description}
                </p>
              )}
              <div className="mt-1 flex justify-end text-xs text-gray-400">
                {form.description.length}/1000
              </div>
            </div>

            {/* GENRE */}
            <div>
              <label className="mb-2 block text-sm text-slate-200">Genre</label>

              <select
                className={`w-full rounded-xl border bg-[#111936] p-3 text-white transition outline-none ${
                  errors.genre
                    ? "border-red-500"
                    : "border-white/10 focus:border-blue-500"
                }`}
                value={form.genre}
                onChange={(e) => {
                  setForm({
                    ...form,
                    genre: e.target.value,
                  });

                  if (errors.genre) {
                    setErrors({
                      ...errors,
                      genre: "",
                    });
                  }
                }}
              >
                <option value="" className="bg-[#111936]">
                  Select Genre
                </option>

                {GENRES.map((genre) => (
                  <option key={genre} value={genre} className="bg-[#111936]">
                    {genre}
                  </option>
                ))}
              </select>

              {errors.genre && (
                <p className="mt-1 text-sm text-red-400">{errors.genre}</p>
              )}
            </div>

            {/* RELEASE YEAR */}
            <div>
              <label className="mb-2 block font-medium">Release Year</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={4}
                placeholder="eg. 2020"
                value={form.releaseYear === "" ? "" : String(form.releaseYear)}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d*$/.test(value)) {
                    setForm({
                      ...form,
                      releaseYear: value === "" ? "" : Number(value),
                    });
                    if (errors.releaseYear)
                      setErrors({ ...errors, releaseYear: undefined });
                  }
                }}
                className={`h-14 w-full rounded-xl border bg-[#111936] p-4 text-lg text-white focus:outline-none ${
                  errors.releaseYear
                    ? "border-red-500"
                    : "border-white/10 focus:border-blue-500"
                }`}
              />
              {errors.releaseYear && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.releaseYear}
                </p>
              )}
            </div>
          </div>

          {/* RIGHT SIDE: SERIES POSTER UPLOADER */}
          <div className="flex flex-col">
            <div>
              <ImageUploader
                label={
                  isEditMode
                    ? "Upload New Series Poster"
                    : "Upload Series Poster"
                }
                type="POSTER"
                value={thumbnailUrl ?? undefined}
                onChange={(file) => {
                  setForm({
                    ...form,
                    thumbnail: file,
                  });
                  setFileName(file?.name || "");
                  if (errors.thumbnail) {
                    setErrors({ ...errors, thumbnail: undefined });
                  }
                }}
              />
            </div>

            {/* THUMBNAIL ERROR MESSAGE */}
            {errors.thumbnail && (
              <p className="mt-2 text-sm font-medium text-red-500">
                {errors.thumbnail}
              </p>
            )}
          </div>
        </div>

        {/* BUTTONS (BOTTOM) */}
        <div className="flex gap-4 border-t border-white/10 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 cursor-pointer rounded-xl bg-[#106EE9] py-3 font-bold text-white transition hover:opacity-80 disabled:opacity-50"
          >
            {isSubmitting
              ? "Saving..."
              : isEditMode
                ? "Update Series"
                : "Create Series"}
          </button>

          <button
            type="button"
            onClick={() => router.push("/admin/series")}
            className="cursor-pointer rounded-xl bg-[#F41010] px-6 py-3 font-bold text-white transition hover:opacity-80"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}