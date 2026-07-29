"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { AdvertisementFormData } from "@/types/advertisement";
import ImageUploader from "@/components/ImageUploader";

type Props = {
  initialData?: AdvertisementFormData & {
    thumbnailUrl?: string;
    videoUrl?: string;
  };
  advertisementId?: number;
  onSubmit: (
    data: AdvertisementFormData & { thumbnail: File | null },
  ) => Promise<void>;
};

export default function AdvertisementForm({
  initialData,
  advertisementId,
  onSubmit,
}: Props) {
  const router = useRouter();
  const isEditMode = !!advertisementId;
  const [form, setForm] = useState<AdvertisementFormData>({
    title: "",
    active: true,
    video: null,
  });
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string>("");
  const [thumbnailPreview, setThumbnailPreview] = useState<string | undefined>(
    "",
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [titleAvailable, setTitleAvailable] = useState(true);
  const [isTitleChecked, setIsTitleChecked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmittedAttempt, setHasSubmittedAttempt] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm({
        title: initialData.title || "",
        active: initialData.active ?? true,
        video: null,
      });
      if (initialData.videoUrl) setVideoPreview(initialData.videoUrl);
      if (initialData.thumbnailUrl)
        setThumbnailPreview(initialData.thumbnailUrl);
      setTitleAvailable(true);
      setIsTitleChecked(false);
    }
  }, [initialData]);

  async function handleTitleBlur() {
    const trimmedTitle = form.title.trim();

    if (!trimmedTitle) {
      setErrors((prev) => ({
        ...prev,
        title: "Advertisement title is required",
      }));
      setTitleAvailable(false);
      setIsTitleChecked(true);
      return;
    }
    if (
      isEditMode &&
      initialData?.title &&
      trimmedTitle.toLowerCase().replace(/\s+/g, " ") ===
        initialData.title.trim().toLowerCase().replace(/\s+/g, " ")
    ) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy.title;
        return copy;
      });
      setTitleAvailable(true);
      setIsTitleChecked(true);
      return;
    }
    try {
      const url = `/api/ads/check-title?title=${encodeURIComponent(trimmedTitle)}&id=${advertisementId || ""}`;
      const res = await fetch(url);
      const data = await res.json();

      setIsTitleChecked(true);

      if (data.exists) {
        setErrors((prev) => ({
          ...prev,
          title: "This title is already taken",
        }));
        setTitleAvailable(false);
      } else {
        setErrors((prev) => {
          const copy = { ...prev };
          delete copy.title;
          return copy;
        });
        setTitleAvailable(true);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function validateFormOnSubmit(): Promise<boolean> {
    const tempErrors: Record<string, string> = {};
    const trimmedTitle = form.title.trim();

    if (!trimmedTitle) {
      tempErrors.title = "Advertisement title is required";
    }

    if (!isEditMode && !form.video) {
      tempErrors.video = "Advertisement video file is required";
    }

    let isCurrentTitleAvailable = titleAvailable;

    if (
      trimmedTitle &&
      (!isEditMode ||
        trimmedTitle.toLowerCase().replace(/\s+/g, " ") !==
          initialData?.title?.trim().toLowerCase().replace(/\s+/g, " "))
    ) {
      try {
        const url = `/api/ads/check-title?title=${encodeURIComponent(trimmedTitle)}&id=${advertisementId || ""}`;
        const res = await fetch(url);
        const data = await res.json();

        setIsTitleChecked(true);
        if (data.exists) {
          tempErrors.title = "This title is already taken";
          setTitleAvailable(false);
          isCurrentTitleAvailable = false;
        } else {
          setTitleAvailable(true);
          isCurrentTitleAvailable = true;
        }
      } catch (err) {
        console.error(err);
      }
    }

    setErrors((prev) => ({ ...prev, ...tempErrors }));

    if (
      tempErrors.title ||
      (!isEditMode && tempErrors.video) ||
      !isCurrentTitleAvailable
    ) {
      return false;
    }
    return true;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setHasSubmittedAttempt(true);

    const isValid = await validateFormOnSubmit();
    if (!isValid) return;

    try {
      setIsSubmitting(true);
      await onSubmit({ ...form, thumbnail: thumbnailFile });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  }

  const shouldShowTitleError =
    errors.title ||
    (!titleAvailable && (hasSubmittedAttempt || isTitleChecked));
  const shouldShowVideoError = errors.video && hasSubmittedAttempt;

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
                Advertisement Title
              </label>
              <input
                type="text"
                style={shouldShowTitleError ? { borderColor: "#ef4444" } : {}}
                className={`w-full rounded-xl border bg-[#111936] p-3 text-white transition-all focus:outline-none ${
                  shouldShowTitleError
                    ? "focus:!border-red-500"
                    : "border-white/10 focus:border-blue-500"
                }`}
                value={form.title}
                onChange={(e) => {
                  const newVal = e.target.value;
                  setForm({ ...form, title: newVal });

                  if (newVal.trim()) {
                    setErrors((prev) => {
                      const copy = { ...prev };
                      delete copy.title;
                      return copy;
                    });
                  }
                }}
                onBlur={handleTitleBlur}
              />
              <div className="mt-1">
                {shouldShowTitleError && errors.title && (
                  <p className="text-xs font-medium text-red-400">
                    ⚠ {errors.title}
                  </p>
                )}
                {!errors.title &&
                  !titleAvailable &&
                  (hasSubmittedAttempt || isTitleChecked) && (
                    <p className="text-xs font-medium text-red-400">
                      ⚠ This title is already taken
                    </p>
                  )}
                {titleAvailable &&
                  isTitleChecked &&
                  form.title.trim() &&
                  !errors.title && (
                    <p className="text-xs font-medium text-green-400">
                      ✓ Title is verified and available
                    </p>
                  )}
              </div>
            </div>

            {/* VIDEO FILE & PREVIEW */}
            <div>
              <label className="mb-2 block font-medium text-slate-200">
                {isEditMode
                  ? "Replace Video File (Optional)"
                  : "Advertisement Video File *"}
              </label>
              <div
                style={shouldShowVideoError ? { borderColor: "#ef4444" } : {}}
                className={`relative cursor-pointer rounded-xl border border-dashed bg-[#111936] p-3 text-center transition-all hover:border-white/20 ${
                  shouldShowVideoError
                    ? "border-red-500 bg-red-500/5"
                    : "border-white/10"
                }`}
              >
                <input
                  type="file"
                  accept="video/*"
                  className="absolute inset-0 cursor-pointer opacity-0"
                  onChange={(e) => {
                    const file = e.target.files?.[0] ?? null;
                    setForm({ ...form, video: file });
                    if (file) {
                      setVideoPreview(URL.createObjectURL(file));
                      setErrors((prev) => {
                        const copy = { ...prev };
                        delete copy.video;
                        return copy;
                      });
                    }
                  }}
                />
                <p className="truncate text-xs text-slate-400">
                  {form.video
                    ? `✓ ${form.video.name}`
                    : "Choose File No file chosen"}
                </p>
              </div>
              {shouldShowVideoError && (
                <p className="mt-1.5 text-xs font-medium text-red-500">
                  ⚠ {errors.video}
                </p>
              )}

              {/* VIDEO PREVIEW */}
              {videoPreview && (
                <div className="mt-4 overflow-hidden rounded-xl border border-white/10 bg-[#111936] p-2">
                  <video
                    key={videoPreview}
                    controls
                    className="aspect-video w-full rounded-lg bg-black object-contain"
                  >
                    <source src={videoPreview} type="video/mp4" />
                  </video>
                </div>
              )}
            </div>

            {/* ACTIVE STATUS CHECKBOX */}
            <div className="flex items-center gap-3 py-1">
              <input
                type="checkbox"
                id="active"
                className="h-5 w-5 cursor-pointer rounded border-white/10 bg-[#111936] accent-[#106EE9]"
                checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
              />
              <label
                htmlFor="active"
                className="cursor-pointer text-sm text-slate-200 select-none"
              >
                Active Status (Visible to users)
              </label>
            </div>
          </div>

          {/* RIGHT SIDE: THUMBNAIL IMAGE UPLOADER (16:9 LANDSCAPE) */}
          <div className="flex flex-col">
            <ImageUploader
              label={
                isEditMode
                  ? "Replace Thumbnail (Optional)"
                  : "Advertisement Thumbnail (Optional)"
              }
              type="LANDSCAPE"
              value={thumbnailPreview}
              onChange={(file) => {
                setThumbnailFile(file);
                if (file) {
                  setThumbnailPreview(URL.createObjectURL(file));
                } else {
                  setThumbnailPreview(undefined);
                }
              }}
            />
          </div>
        </div>

        {/* BUTTONS AREA */}
        <div className="flex gap-4 border-t border-white/10 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 cursor-pointer rounded-xl bg-[#106EE9] py-3 text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
          >
            {isSubmitting
              ? "Saving..."
              : isEditMode
                ? "Save Changes"
                : "Create Advertisement"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/ads")}
            className="cursor-pointer rounded-xl bg-[#F41010] px-6 py-3 text-sm font-bold text-white transition-all hover:opacity-90"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
