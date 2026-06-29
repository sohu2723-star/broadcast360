"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { SeriesFormData } from "@/types/serie";
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
      releaseYear: new Date().getFullYear(),
      thumbnail: null,
    }
  );

  const [fileName, setFileName] = useState<string>("");

  const [errors, setErrors] = useState<{
    title?: string[];
    description?: string[];
    genre?: string[];
    releaseYear?: string[];
    thumbnail?: string[];
  }>({});

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const schema = seriesId ? editSeriesSchema : createSeriesSchema;

    // ✅ FIX: prevent NaN crash
    const safeData = {
      ...form,
      releaseYear:
        typeof form.releaseYear === "number" &&
        !isNaN(form.releaseYear)
          ? form.releaseYear
          : undefined,
    };

    const result = schema.safeParse(safeData);

    if (!result.success) {
      setErrors(result.error.flatten().fieldErrors);
      return;
    }

    setErrors({});
    await onSubmit(form);
  }

  return (
    <div className="bg-[#0B1026] border border-white/10 rounded-2xl p-8 max-w-3xl">
      <form className="space-y-5" onSubmit={handleSubmit}>
        {/* TITLE */}
        <div>
          <label className="block mb-2">Series Title</label>

          <input
            value={form.title}
            onChange={(e) =>
              setForm({ ...form, title: e.target.value })
            }
            className="w-full bg-[#111936] border border-white/10 rounded-xl p-3"
          />

          {errors.title && (
            <p className="text-red-500 text-sm mt-1">
              {errors.title[0]}
            </p>
          )}
        </div>

        {/* DESCRIPTION */}
        <div>
          <label className="block mb-2">Description</label>

          <textarea
            rows={4}
            value={form.description}
            onChange={(e) =>
              setForm({
                ...form,
                description: e.target.value,
              })
            }
            className="w-full bg-[#111936] border border-white/10 rounded-xl p-3"
          />

          {errors.description && (
            <p className="text-red-500 text-sm mt-1">
              {errors.description[0]}
            </p>
          )}
        </div>

        {/* GENRE */}
        <div>
          <label className="block mb-2">Genre</label>

          <input
            value={form.genre}
            onChange={(e) =>
              setForm({ ...form, genre: e.target.value })
            }
            className="w-full bg-[#111936] border border-white/10 rounded-xl p-3"
          />

          {errors.genre && (
            <p className="text-red-500 text-sm mt-1">
              {errors.genre[0]}
            </p>
          )}
        </div>

        {/* RELEASE YEAR */}
        <div>
          <label className="block mb-2">Release Year</label>

          <input
            type="number"
            value={form.releaseYear || ""}
            onChange={(e) =>
              setForm({
                ...form,
                releaseYear: Number(e.target.value),
              })
            }
            className="w-full bg-[#111936] border border-white/10 rounded-xl p-3"
          />

          {errors.releaseYear && (
            <p className="text-red-500 text-sm mt-1">
              {errors.releaseYear[0]}
            </p>
          )}
        </div>

        {/* CURRENT THUMBNAIL */}
        {thumbnailUrl && (
          <div>
            <label className="block mb-2">
              Current Thumbnail
            </label>

            <Image
              src={thumbnailUrl}
              alt="Thumbnail"
              width={250}
              height={150}
              className="rounded-lg border border-white/10 object-cover"
            />
          </div>
        )}

        {/* FILE UPLOAD (FIXED UI) */}
        <div>
          <label className="block mb-2">
            {seriesId ? "Upload New Thumbnail" : "Upload Thumbnail"}
          </label>

          <label className="flex items-center gap-3">
            <span className="px-4 py-2 bg-blue-600 rounded cursor-pointer">
              Choose File
            </span>

            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;

                setForm({ ...form, thumbnail: file });
                setFileName(file?.name || "");
              }}
            />

            <span className="text-sm text-gray-400">
              {fileName || "No file selected"}
            </span>
          </label>

          {errors.thumbnail && (
            <p className="text-red-500 text-sm mt-1">
              {errors.thumbnail[0]}
            </p>
          )}
        </div>

        {/* BUTTONS */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            className="flex-1 bg-[#106EE9] py-3 rounded-xl font-bold hover:opacity-80"
          >
            Save Series
          </button>

          <button
            type="button"
            onClick={() => router.push("/admin/series")}
            className="bg-[#F41010] px-6 py-3 rounded-xl font-bold hover:opacity-80"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}