"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { MovieFormData } from "@/types/movie";
import Image from "next/image";
import {
  createMovieSchema,
  editMovieSchema,
} from "@/lib/validators/movie.validator";

type Props = {
  initialData?: MovieFormData;
  movieId?: number;
  onSubmit: (data: MovieFormData) => Promise<void>;
};

export default function MovieForm({
  initialData,
  movieId,
  onSubmit,
}: Props) {
  const router = useRouter();

  const [form, setForm] = useState<MovieFormData>(
    initialData ?? {
      title: "",
      description: "",
      genre: "",
      video: null,
      thumbnail: null,
      releaseYear: new Date().getFullYear(),
    }
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const schema = movieId ? editMovieSchema : createMovieSchema;
    const result = schema.safeParse(form);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};

      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as string;
        if (field) fieldErrors[field] = issue.message;
      });

      setErrors(fieldErrors);
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
          <label className="block mb-2">Movie Title</label>
          <input
            className="w-full bg-[#111936] border border-white/10 rounded-xl p-3"
            value={form.title}
            onChange={(e) =>
              setForm({ ...form, title: e.target.value })
            }
          />
          {errors.title && (
            <p className="text-red-500 text-sm">{errors.title}</p>
          )}
        </div>

        {/* DESCRIPTION */}
        <div>
          <label className="block mb-2">Description</label>
          <textarea
            rows={4}
            className="w-full bg-[#111936] border border-white/10 rounded-xl p-3"
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
          />
          {errors.description && (
            <p className="text-red-500 text-sm">{errors.description}</p>
          )}
        </div>

        {/* GENRE */}
        <div>
          <label className="block mb-2">Genre</label>
          <input
            className="w-full bg-[#111936] border border-white/10 rounded-xl p-3"
            value={form.genre}
            onChange={(e) =>
              setForm({ ...form, genre: e.target.value })
            }
          />
        </div>

        {/* VIDEO */}
        <div>
          <label className="block mb-2">Movie File</label>
          <input
            type="file"
            accept="video/*"
            className="w-full bg-[#111936] border border-white/10 rounded-xl p-3"
            onChange={(e) => {
              const file = e.target.files?.[0] ?? null;

              setForm({ ...form, video: file });

              if (file) {
                setVideoPreview(URL.createObjectURL(file));
              }
            }}
          />

          {/* VIDEO PREVIEW */}
          {videoPreview && (
            <video
              src={videoPreview}
              controls
              className="mt-3 w-full rounded-lg border border-white/10"
            />
          )}
        </div>

        {/* THUMBNAIL */}
        <div>
          <label className="block mb-2">Thumbnail</label>
          <input
            type="file"
            accept="image/*"
            className="w-full bg-[#111936] border border-white/10 rounded-xl p-3"
            onChange={(e) => {
              const file = e.target.files?.[0] ?? null;

              setForm({ ...form, thumbnail: file });

              if (file) {
                setThumbnailPreview(URL.createObjectURL(file));
              }
            }}
          />

          {/* THUMBNAIL PREVIEW */}
          {thumbnailPreview && (
            <Image
              alt="Thumbnail Preview"
              src={thumbnailPreview}
              width={160}
              height={96}
              className="mt-3 w-40 h-24 object-cover rounded-lg border border-white/10"
            />
          )}
        </div>

        {/* RELEASE YEAR */}
        <div>
          <label className="block mb-2">Release Year</label>
          <input
            type="number"
            className="w-full bg-[#111936] border border-white/10 rounded-xl p-3"
            value={form.releaseYear}
            onChange={(e) =>
              setForm({
                ...form,
                releaseYear: Number(e.target.value),
              })
            }
          />
          {errors.releaseYear && (
            <p className="text-red-500 text-sm">{errors.releaseYear}</p>
          )}
        </div>

        {/* BUTTONS */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            className="flex-1 bg-[#106EE9] py-3 rounded-xl font-bold"
          >
            Save Movie
          </button>

          <button
            type="button"
            onClick={() => router.push("/admin/movies")}
            className="bg-[#F41010] px-6 py-3 rounded-xl font-bold"
          >
            Cancel
          </button>
        </div>

      </form>
    </div>
  );
}