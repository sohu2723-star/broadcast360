"use client";

import { useState, useRef, useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import type { EntertainmentFormData } from "@/types/entertainment";
import { GENRES } from "@/lib/constants/genres";
import {
  createEntertainmentSchema,
  editEntertainmentSchema,
} from "@/lib/validators/entertainment.validator";
import ImageUploader from "@/components/ImageUploader";

type Props = {
  onSubmit: (data: EntertainmentFormData) => Promise<void>;

  entertainmentId?: number;

  initialData?: EntertainmentFormData;

  initialThumbnail?: string;

  initialVideo?: string;

  titleError?: string;

  clearTitleError?: () => void;

  onCancel?: () => void;
};

export default function EntertainmentForm({
  onSubmit,
  entertainmentId,
  initialData,
  initialThumbnail,
  initialVideo,
  titleError,
  clearTitleError,
}: Props) {
  const router = useRouter();

  const [form, setForm] = useState<EntertainmentFormData>({
    title: "",
    description: "",
    category: "",
    releaseYear: 0,
    duration: 0,
    video: null,
    thumbnail: null,
  });
  const initialized = useRef(false);

  useEffect(() => {
    if (initialData && !initialized.current) {
      setForm(initialData);

      initialized.current = true;
    }
  }, [initialData]);

  const [videoPreview, setVideoPreview] = useState(initialVideo ?? "");

  const [thumbnailPreview, setThumbnailPreview] = useState(
    initialThumbnail ?? "",
  );

  const isCreateMode = !entertainmentId;

  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    setVideoPreview(initialVideo ?? "");

    setThumbnailPreview(initialThumbnail ?? "");
  }, [initialVideo, initialThumbnail]);
  const originalVideo = useRef(initialVideo ?? "");

  const originalThumbnail = useRef(initialThumbnail ?? "");
  const [videoName, setVideoName] = useState("");
  const [thumbnailName, setThumbnailName] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const videoInputRef = useRef<HTMLInputElement>(null);
  const videoPickerOpened = useRef(false);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  const thumbnailPickerOpened = useRef(false);
  function openVideoPicker() {
    videoPickerOpened.current = true;

    if (videoInputRef.current) {
      videoInputRef.current.value = "";

      videoInputRef.current.click();
    }
  }
  function openThumbnailPicker() {
    thumbnailPickerOpened.current = true;

    if (thumbnailInputRef.current) {
      thumbnailInputRef.current.value = "";

      thumbnailInputRef.current.click();
    }
  }
  useEffect(() => {
    function handleFocus() {
      setTimeout(() => {
        // VIDEO CANCEL

        if (videoPickerOpened.current) {
          const input = videoInputRef.current;

          if (input && !input.files?.length) {
            setForm((prev) => ({
              ...prev,
              video: null,
            }));

            if (entertainmentId) {
              // EDIT
              setVideoPreview(originalVideo.current);
            } else {
              // CREATE
              setVideoPreview("");
            }

            setVideoName("");

            // CREATE ONLY
            if (!entertainmentId) {
              setErrors((prev) => ({
                ...prev,
                video: "Video file is required",
              }));
            }
          }

          videoPickerOpened.current = false;
        }

        // THUMBNAIL CANCEL

        if (thumbnailPickerOpened.current) {
          const input = thumbnailInputRef.current;

          if (input && !input.files?.length) {
            setForm((prev) => ({
              ...prev,
              thumbnail: null,
            }));

            if (entertainmentId) {
              // EDIT
              setThumbnailPreview(originalThumbnail.current);
            } else {
              // CREATE
              setThumbnailPreview("");
            }

            setThumbnailName("");

            // CREATE ONLY
            if (!entertainmentId) {
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

    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [entertainmentId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const schema = entertainmentId
      ? editEntertainmentSchema
      : createEntertainmentSchema;

    const result = schema.safeParse(form);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};

      result.error.issues.forEach((issue) => {
        const key = issue.path[0]?.toString();

        if (key) {
          fieldErrors[key] = issue.message;
        }
      });

      setErrors(fieldErrors);

      return;
    }

    setErrors({});

    await onSubmit({
      ...result.data,
      duration: result.data.duration ?? 0,
      thumbnail: result.data.thumbnail ?? null,
      video: result.data.video ?? null,
    });
  }

  return (
    <div className="max-w-6xl rounded-2xl border border-white/10 bg-[#0B1026] p-8 text-white">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* LEFT AND RIGHT GRID LAYOUT */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* LEFT SIDE: FORM INPUTS & VIDEO PREVIEW */}
          <div className="space-y-5">
            {/* TITLE */}
            <div>
              <label className="mb-2 block font-medium text-slate-200">
                Entertainment Title
              </label>
              <input
                className={`w-full rounded-xl border bg-[#111936] p-3 text-white transition-all focus:outline-none ${
                  errors.title
                    ? "border-red-500 focus:border-red-500"
                    : "border-white/10 focus:border-blue-500"
                }`}
                value={form.title}
                onChange={(e) => {
                  setForm({
                    ...form,
                    title: e.target.value,
                  });

                  if (errors.title) {
                    setErrors({
                      ...errors,
                      title: "",
                    });
                  }

                  if (titleError && clearTitleError) {
                    clearTitleError();
                  }
                }}
                placeholder="Enter entertainment title"
              />

              {errors.title && (
                <p className="mt-1 text-xs font-medium text-red-400">
                  <AlertTriangle size={14} strokeWidth={1.8} className="mr-1 inline-block align-text-bottom" aria-hidden="true" />{errors.title}
                </p>
              )}

              {titleError && (
                <p className="mt-1 text-xs font-medium text-red-400">
                  <AlertTriangle size={14} strokeWidth={1.8} className="mr-1 inline-block align-text-bottom" aria-hidden="true" />{titleError}
                </p>
              )}
            </div>

            {/* CATEGORY & RELEASE YEAR (2 COLUMNS) */}
            <div className="grid grid-cols-2 gap-4">
              {/* CATEGORY */}
              <div>
                <label className="mb-2 block text-sm text-slate-200">
                  Category
                </label>

                <select
                  className={`w-full rounded-lg border bg-[#111936] p-3 text-white transition outline-none ${
                    errors.category
                      ? "border-red-500"
                      : "border-white/10 focus:border-blue-500"
                  }`}
                  value={form.category}
                  onChange={(e) => {
                    setForm({
                      ...form,
                      category: e.target.value,
                    });

                    if (errors.category) {
                      setErrors({
                        ...errors,
                        category: "",
                      });
                    }
                  }}
                >
                  <option value="" className="bg-[#111936]">
                    Select Category
                  </option>

                  {GENRES.map((genre) => (
                    <option key={genre} value={genre} className="bg-[#111936]">
                      {genre}
                    </option>
                  ))}
                </select>

                {errors.category && (
                  <p className="mt-1 text-xs text-red-400">{errors.category}</p>
                )}
              </div>

              {/* RELEASE YEAR */}
              <div>
                <label className="mb-2 block font-medium text-slate-200">
                  Release Year
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={4}
                  placeholder="2026"
                  className={`w-full rounded-xl border bg-[#111936] p-3 text-white transition-all focus:outline-none ${
                    errors.releaseYear
                      ? "border-red-500"
                      : "border-white/10 focus:border-blue-500"
                  }`}
                  value={form.releaseYear === 0 ? "" : String(form.releaseYear)}
                  onChange={(e) => {
                    const value = e.target.value;

                    if (/^\d*$/.test(value)) {
                      setForm({
                        ...form,
                        releaseYear: value === "" ? 0 : Number(value),
                      });

                      if (errors.releaseYear) {
                        setErrors({
                          ...errors,
                          releaseYear: "",
                        });
                      }
                    }
                  }}
                />

                {errors.releaseYear && (
                  <p className="mt-1 text-xs font-medium text-red-400">
                    <AlertTriangle size={14} strokeWidth={1.8} className="mr-1 inline-block align-text-bottom" aria-hidden="true" />{errors.releaseYear}
                  </p>
                )}
              </div>
            </div>

            {/* DESCRIPTION */}
            <div>
              <label className="mb-2 block font-medium text-slate-200">
                Description
              </label>
              <textarea
                rows={3}
                className={`w-full rounded-xl border bg-[#111936] p-3 text-white transition-all focus:outline-none ${
                  errors.description
                    ? "border-red-500"
                    : "border-white/10 focus:border-blue-500"
                }`}
                value={form.description}
                onChange={(e) => {
                  setForm({
                    ...form,
                    description: e.target.value,
                  });

                  if (errors.description) {
                    setErrors({
                      ...errors,
                      description: "",
                    });
                  }
                }}
                placeholder="Enter description..."
              />

              {errors.description && (
                <p className="mt-1 text-xs font-medium text-red-400">
                  <AlertTriangle size={14} strokeWidth={1.8} className="mr-1 inline-block align-text-bottom" aria-hidden="true" />{errors.description}
                </p>
              )}
            </div>

            {/* VIDEO FILE UPLOADER & PREVIEW */}
            <div>
              <label className="mb-2 block font-medium text-slate-200">
                Video File
              </label>
              <button
                type="button"
                onClick={openVideoPicker}
                className="flex h-12 w-full cursor-pointer items-center justify-center rounded-xl border border-dashed border-white/20 bg-[#111936] transition-all hover:border-blue-500"
              >
                <span className="truncate px-4 text-sm text-slate-400">
                  {videoName ? `✓ ${videoName}` : "Choose Video File"}
                </span>
              </button>

              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null;

                  setForm({
                    ...form,
                    video: file,
                  });

                  if (file) {
                    const preview = URL.createObjectURL(file);
                    setVideoPreview(preview);
                    setVideoName(file.name);

                    if (!entertainmentId) {
                      setShowPreview(true);
                    }

                    setErrors({
                      ...errors,
                      video: "",
                    });
                  } else {
                    if (entertainmentId) {
                      setVideoPreview(originalVideo.current);
                    } else {
                      setVideoPreview("");
                    }
                    setVideoName("");
                  }
                }}
              />

              {errors.video && (
                <p className="mt-1 text-xs font-medium text-red-400">
                  <AlertTriangle size={14} strokeWidth={1.8} className="mr-1 inline-block align-text-bottom" aria-hidden="true" />{errors.video}
                </p>
              )}

              {/* VIDEO PREVIEW BOX */}
              {videoPreview && (
                <div className="mt-4 overflow-hidden rounded-xl border border-white/10 bg-[#111936] p-2">
                  <video
                    key={videoPreview}
                    controls
                    className="aspect-video w-full rounded-lg bg-black object-contain"
                  >
                    <source src={videoPreview} />
                  </video>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT SIDE: THUMBNAIL IMAGE UPLOADER */}
          <div className="flex flex-col">
            <ImageUploader
              label="Entertainment Thumbnail"
              type="POSTER"
              value={thumbnailPreview || undefined}
              onChange={(file) => {
                setForm({
                  ...form,
                  thumbnail: file,
                });

                if (file) {
                  setThumbnailPreview(URL.createObjectURL(file));
                  setThumbnailName(file.name);

                  if (!entertainmentId) {
                    setShowPreview(true);
                  }

                  setErrors({
                    ...errors,
                    thumbnail: "",
                  });
                } else {
                  setThumbnailPreview("");
                  setThumbnailName("");
                }
              }}
            />
            {errors.thumbnail && (
              <p className="mt-1 text-xs font-medium text-red-400">
                <AlertTriangle size={14} strokeWidth={1.8} className="mr-1 inline-block align-text-bottom" aria-hidden="true" />{errors.thumbnail}
              </p>
            )}
          </div>
        </div>

        {/* BUTTONS AREA */}
        <div className="mt-6 flex gap-4 border-t border-white/10 pt-4">
          <button
            type="submit"
            className="flex-1 cursor-pointer rounded-xl bg-[#4f6689] py-3 text-sm font-bold text-white transition-all hover:opacity-80"
          >
            {entertainmentId ? "Update Entertainment" : "Create Entertainment"}
          </button>

          <button
            type="button"
            onClick={() => router.push("/admin/entertainments")}
            className="cursor-pointer rounded-xl bg-[#F41010] px-6 py-3 text-sm font-bold text-white transition-all hover:opacity-80"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
