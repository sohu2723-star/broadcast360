
"use client";

import { useState, useRef, useEffect } from "react";
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
  apiError?: string;
  onSubmit: (data: MovieFormData) => Promise<void>;

  showPreview?: boolean;

  onPreviewChange?: (
    video: string | null,
    thumbnail: string | null
  ) => void;
};

export default function MovieForm({
  initialData,
  movieId,
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
    }
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const filePickerOpened = useRef(false);
  const thumbnailPickerOpened = useRef(false);
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
  setForm((prev) => ({
    ...prev,
    video: null,
  }));

  setVideoPreview(null);

  onPreviewChange?.(null, null);

  if (!movieId) {
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
  setForm((prev) => ({
    ...prev,
    thumbnail: null,
  }));

  setThumbnailPreview(null);

  onPreviewChange?.(null, null);

  if (!movieId) {
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
  }, [movieId]);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
 

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
  <label className="block mb-2">
    Movie Title
  </label>

  <input
    className="w-full bg-[#111936] border border-white/10 rounded-xl p-3"
    value={form.title}
    onChange={(e) => {
      setForm({
        ...form,
        title: e.target.value,
      });

     
    }}
  />

  {errors.title && (
    <p className="text-red-500 text-sm">
      {errors.title}
    </p>
  )}

  {apiError && (
    <p className="text-red-500 text-sm mt-1">
      {apiError}
    </p>
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
        {/* VIDEO */}
        <div>
          <label className="block mb-2">Movie File</label>

          <button
            type="button"
            onClick={openVideoPicker}
            className="w-full bg-[#111936] border border-white/10 rounded-xl p-3 text-left"
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

              if (!file) {
                return;
              }

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

onPreviewChange?.(
  url,
  thumbnailPreview
);
            }}
          />

          {form.video && (
            <p className="text-sm mt-2">
              {form.video.name}
            </p>
          )}

          {errors.video && (
            <p className="text-red-500 text-sm">
              {errors.video}
            </p>
          )}

          {/* VIDEO PREVIEW */}
          {showPreview && videoPreview && (
  <video
    src={videoPreview}
    controls
    className="mt-3 w-full rounded-lg border border-white/10"
  />
)}
        </div>

        {/* THUMBNAIL */}
        {/* THUMBNAIL */}
        <div>
          <label className="block mb-2">Thumbnail</label>

          <button
            type="button"
            onClick={openThumbnailPicker}
            className="w-full bg-[#111936] border border-white/10 rounded-xl p-3 text-left"
          >
            Choose Thumbnail File
          </button>

          <input
            ref={thumbnailInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0] ?? null;

              if (!file) {
                return;
              }

              const allowedTypes = [
                "image/jpeg",
                "image/png",
                "image/webp",
              ];

              if (!allowedTypes.includes(file.type)) {
                setErrors((p) => ({
                  ...p,
                  thumbnail: "Invalid image format",
                }));
                return;
              }

              setErrors((p) => ({
                ...p,
                thumbnail: "",
              }));

              setForm((prev) => ({
                ...prev,
                thumbnail: file,
              }));

              const url = URL.createObjectURL(file);

setThumbnailPreview(url);

onPreviewChange?.(
  videoPreview,
  url
);
            }}
          />

          {errors.thumbnail && (
            <p className="text-red-500 text-sm">
              {errors.thumbnail}
            </p>
          )}

          {showPreview && thumbnailPreview && (
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
  type="text"
  inputMode="numeric"
  maxLength={4}
  className="w-full bg-[#111936] border border-white/10 rounded-xl p-3"
  value={form.releaseYear || ""}
  placeholder="YYYY"
  onChange={(e) => {
    const value = e.target.value;

    // allow only 0-9 and max 4 digits
    if (/^\d{0,4}$/.test(value)) {
      setForm({
        ...form,
        releaseYear: value === "" ? 0 : Number(value),
      });
    }
  }}
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