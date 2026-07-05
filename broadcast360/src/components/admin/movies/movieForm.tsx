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
      releaseYear: 0,
    }
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  function clearForm() {
    setForm({
      title: "",
      description: "",
      genre: "",
      video: null,
      thumbnail: null,
      releaseYear: 0,
    });

    setErrors({});
    setThumbnailPreview(null);
    setVideoPreview(null);
  }

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

          {errors.genre && (
            <p className="text-red-500 text-sm">{errors.genre}</p>
          )}
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

              if (!file) {
                setErrors((p) => ({ ...p, video: "Movie file is required" }));
                return;
              }

              const allowedTypes = ["video/mp4", "video/webm", "video/quicktime"];

              if (!allowedTypes.includes(file.type)) {
                setErrors((p) => ({ ...p, video: "Invalid video format" }));
                return;
              }

              setErrors((p) => ({ ...p, video: "" }));

              setForm({ ...form, video: file });
              setVideoPreview(URL.createObjectURL(file));
            }}
          />

          {errors.video && (
            <p className="text-red-500 text-sm">{errors.video}</p>
          )}

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

              if (!file) {
                setErrors((p) => ({ ...p, thumbnail: "Thumbnail is required" }));
                return;
              }

              const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

              if (!allowedTypes.includes(file.type)) {
                setErrors((p) => ({
                  ...p,
                  thumbnail: "Invalid image format",
                }));
                return;
              }

              setErrors((p) => ({ ...p, thumbnail: "" }));

              setForm({ ...form, thumbnail: file });
              setThumbnailPreview(URL.createObjectURL(file));
            }}
          />

          {errors.thumbnail && (
            <p className="text-red-500 text-sm">{errors.thumbnail}</p>
          )}

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
            value={form.releaseYear || ""}
            placeholder="Choose release year"
            onChange={(e) =>
              setForm({
                ...form,
                releaseYear: e.target.value === "" ? 0 : Number(e.target.value),
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
            onClick={clearForm}
            className="bg-gray-500 px-6 py-3 rounded-xl font-bold"
          >
            Clear
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