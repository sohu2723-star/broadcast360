"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { MovieFormData } from "@/types/movie";
import { GENRES } from "@/lib/constants/genres";
import {
  createMovieSchema,
  editMovieSchema,
} from "@/lib/validators/movie.validator";
import ImageUploader from "@/components/ImageUploader";

type Props = {
  initialData?: MovieFormData;
  movieId?: number;
  initialVideoUrl?: string | null;
  initialThumbnailUrl?: string | null;
  apiError?: string;
  onSubmit: (data: MovieFormData) => Promise<void>;
  showPreview?: boolean;
  onPreviewChange?: (video: string | null, thumbnail: string | null) => void;
};

export default function MovieForm({
  initialData,
  movieId,
  initialVideoUrl,
  initialThumbnailUrl,
  apiError,
  onSubmit,
  onPreviewChange,
  showPreview = true,
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
    },
  );

  const isEditMode = !!movieId;
  const [errors, setErrors] = useState<Record<string, string>>({});

  // THUMBNAIL & VIDEO PREVIEW STATES
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(
    initialThumbnailUrl ?? null,
  );

  const [videoPreview, setVideoPreview] = useState<string | null>(
    initialVideoUrl ?? null,
  );

  const videoInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const filePickerOpened = useRef(false);
  const thumbnailPickerOpened = useRef(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialVideoUrl) {
      setVideoPreview(initialVideoUrl);
    }
  }, [initialVideoUrl]);

  useEffect(() => {
    if (initialThumbnailUrl) {
      setThumbnailPreview(initialThumbnailUrl);
    }
  }, [initialThumbnailUrl]);

  function openVideoPicker() {
    filePickerOpened.current = true;
    videoInputRef.current?.click();
  }

  function openThumbnailPicker() {
    thumbnailPickerOpened.current = true;
    thumbnailInputRef.current?.click();
  }

  useEffect(() => {
    function handleWindowFocus() {
      setTimeout(() => {
        // VIDEO CANCEL
        if (filePickerOpened.current) {
          const input = videoInputRef.current;

          if (input && !input.files?.length) {
            if (!form.video) {
              setVideoPreview(initialVideoUrl ?? null);
            }

            if (!movieId && !initialVideoUrl) {
              setErrors((prev) => ({
                ...prev,
                video: "Movie file is required",
              }));
            }
          }

          filePickerOpened.current = false;
        }

        // THUMBNAIL CANCEL
        if (thumbnailPickerOpened.current) {
          const input = thumbnailInputRef.current;
          if (input && !input.files?.length) {
            if (!form.thumbnail) {
              setThumbnailPreview(initialThumbnailUrl ?? null);
            }

            if (!movieId && !initialThumbnailUrl) {
              setErrors((prev) => ({
                ...prev,
                thumbnail: "Thumbnail is required",
              }));
            }
          }

          thumbnailPickerOpened.current = false;
        }
      }, 300);
    }

    window.addEventListener("focus", handleWindowFocus);

    return () => {
      window.removeEventListener("focus", handleWindowFocus);
    };
  }, [
    movieId,
    initialVideoUrl,
    initialThumbnailUrl,
    form.video,
    form.thumbnail,
  ]);

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
    setIsSubmitting(true);
    try {
      await onSubmit(form);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-6xl rounded-2xl border border-white/10 bg-[#0B1026] p-8 text-white">
      <form className="space-y-6" onSubmit={handleSubmit}>
        {/* LEFT & RIGHT GRID LAYOUT */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* LEFT SIDE: INPUT FIELDS & VIDEO */}
          <div className="space-y-5">
            {/* TITLE */}
            <div>
              <label className="mb-2 block font-medium">Movie Title</label>
              <input
                className="w-full rounded-xl border border-white/10 bg-[#111936] p-3 text-white focus:border-blue-500 focus:outline-none"
                value={form.title}
                onChange={(e) => {
                  setForm({
                    ...form,
                    title: e.target.value,
                  });
                }}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-500">{errors.title}</p>
              )}
              {apiError && (
                <p className="mt-1 text-sm text-red-500">{apiError}</p>
              )}
            </div>

            {/* DESCRIPTION */}
            <div>
              <label className="mb-2 block font-medium">Description</label>
              <textarea
                rows={4}
                className="w-full rounded-xl border border-white/10 bg-[#111936] p-3 text-white focus:border-blue-500 focus:outline-none"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.description}
                </p>
              )}
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
                <option value="">Select Genre</option>

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
                className="w-full rounded-xl border border-white/10 bg-[#111936] p-3 text-white focus:border-blue-500 focus:outline-none"
                value={form.releaseYear || ""}
                placeholder="2026"
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d{0,4}$/.test(value)) {
                    setForm({
                      ...form,
                      releaseYear: value === "" ? 0 : Number(value),
                    });
                  }
                }}
              />
              {errors.releaseYear && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.releaseYear}
                </p>
              )}
            </div>

            {/* VIDEO FILE */}
            <div>
              <label className="mb-2 block font-medium">Movie File</label>
              <button
                type="button"
                onClick={openVideoPicker}
                className="w-full cursor-pointer rounded-xl border border-white/10 bg-[#111936] p-3 text-left text-gray-300 transition hover:border-gray-500"
              >
                Choose Video File
              </button>

              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null;
                  if (!file) return;

                  const allowedTypes = [
                    "video/mp4",
                    "video/webm",
                    "video/quicktime",
                  ];

                  if (!allowedTypes.includes(file.type)) {
                    setErrors((p) => ({
                      ...p,
                      video: "Invalid video format",
                    }));
                    return;
                  }

                  setErrors((p) => ({
                    ...p,
                    video: "",
                  }));

                  setForm((prev) => ({
                    ...prev,
                    video: file,
                  }));

                  const url = URL.createObjectURL(file);
                  setVideoPreview(url);
                  onPreviewChange?.(url, thumbnailPreview);
                }}
              />

              {form.video && (
                <p className="mt-2 text-sm text-gray-300">
                  📁 {form.video.name}
                </p>
              )}

              {errors.video && (
                <p className="mt-1 text-sm text-red-500">{errors.video}</p>
              )}

              {/* VIDEO PREVIEW - videoPreview  */}
              {videoPreview && (
                <div className="mt-3 overflow-hidden rounded-xl border border-white/10 bg-black/40">
                  <video
                    key={videoPreview}
                    src={videoPreview}
                    controls
                    className="w-full rounded-lg"
                  />
                </div>
              )}
            </div>
          </div>

          {/* RIGHT SIDE: MOVIE POSTER UPLOADER */}
          <div className="flex flex-col">
            <ImageUploader
              label="Movie Poster"
              type="POSTER"
              value={thumbnailPreview ?? undefined}
              onChange={(file) => {
                setErrors((prev) => ({
                  ...prev,
                  thumbnail: "",
                }));

                setForm((prev) => ({
                  ...prev,
                  thumbnail: file,
                }));

                if (file) {
                  const url = URL.createObjectURL(file);
                  setThumbnailPreview(url);
                  onPreviewChange?.(videoPreview, url);
                } else {
                  setThumbnailPreview(initialThumbnailUrl ?? "");
                  onPreviewChange?.(videoPreview, initialThumbnailUrl ?? "");
                }
              }}
            />

            {errors.thumbnail && (
              <p className="mt-2 text-sm text-red-500">{errors.thumbnail}</p>
            )}
          </div>
        </div>

        {/* BUTTONS (BOTTOM) */}
        <div className="flex gap-4 border-t border-white/10 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 cursor-pointer rounded-xl bg-[#4f6689] py-3 text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
          >
            {isSubmitting
              ? "Saving..."
              : isEditMode
                ? "Save Changes"
                : "Create Movie"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/movies")}
            className="cursor-pointer rounded-xl bg-[#F41010] px-6 py-3 font-bold text-white transition hover:opacity-80"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
