"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { AdvertisementFormData } from "@/types/advertisement";

type Props = {
  initialData?: AdvertisementFormData & { thumbnailUrl?: string; videoUrl?: string };
  advertisementId?: number;
  onSubmit: (data: AdvertisementFormData & { thumbnail: File | null }) => Promise<void>;
};

export default function AdvertisementForm({ initialData, advertisementId, onSubmit }: Props) {
  const router = useRouter();
  const isEditMode = !!advertisementId;
  const [form, setForm] = useState<AdvertisementFormData>({ title: "", active: true, video: null });
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string>("");
  const [thumbnailPreview, setThumbnailPreview] = useState<string>("");
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
      if (initialData.thumbnailUrl) setThumbnailPreview(initialData.thumbnailUrl);
      setTitleAvailable(true);
      setIsTitleChecked(false);
    }
  }, [initialData]);

  async function handleTitleBlur() {
    const trimmedTitle = form.title.trim();
    
    if (!trimmedTitle) {
      setErrors((prev) => ({ ...prev, title: "Advertisement title is required" }));
      setTitleAvailable(false);
      setIsTitleChecked(true);
      return;
    }
    if (isEditMode && initialData?.title && trimmedTitle.toLowerCase().replace(/\s+/g, " ") === initialData.title.trim().toLowerCase().replace(/\s+/g, " ")) {
      setErrors((prev) => { const copy = { ...prev }; delete copy.title; return copy; });
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
        setErrors((prev) => ({ ...prev, title: "This title is already taken" }));
        setTitleAvailable(false);
      } else {
        setErrors((prev) => { const copy = { ...prev }; delete copy.title; return copy; });
        setTitleAvailable(true);
      }
    } catch (err) {
      console.error(err);
    }
  }

  function validateFormOnSubmit(): boolean {
    const tempErrors: Record<string, string> = {};

    if (!form.title.trim()) {
      tempErrors.title = "Advertisement title is required";
    }

    if (!isEditMode && !form.video) {
      tempErrors.video = "Advertisement video file is required";
    }

    setErrors((prev) => ({ ...prev, ...tempErrors }));
  
    if (tempErrors.title || (!isEditMode && tempErrors.video) || !titleAvailable) {
      return false;
    }
    return true;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setHasSubmittedAttempt(true);

    const isValid = validateFormOnSubmit();
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

  const shouldShowTitleError = errors.title && hasSubmittedAttempt;
  const shouldShowVideoError = errors.video && hasSubmittedAttempt;

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-stretch">
        
        {/* LEFT COLUMN: PREVIEWS */}
        <div className="lg:col-span-2 space-y-5 flex flex-col justify-start">
          <div className="bg-[#111936] border border-white/5 rounded-2xl p-4">
            <label className="block text-xs font-semibold tracking-wider text-slate-400 uppercase mb-3">
              Video Preview
            </label>
            <div className="bg-[#070b19] rounded-xl aspect-video overflow-hidden border border-white/10 flex items-center justify-center">
              {videoPreview ? (
                <video key={videoPreview} controls className="w-full h-full object-contain bg-black">
                  <source src={videoPreview} type="video/mp4" />
                </video>
              ) : (
                <p className="text-xs text-slate-500 italic">Upload Video</p>
              )}
            </div>
          </div>

          <div className="bg-[#111936] border border-white/5 rounded-2xl p-4">
            <label className="block text-xs font-semibold tracking-wider text-slate-400 uppercase mb-3">
              Thumbnail Preview
            </label>
            <div className="bg-[#070b19] rounded-xl aspect-video overflow-hidden border border-white/10 flex items-center justify-center">
              {thumbnailPreview ? (
                <img src={thumbnailPreview} alt="Thumbnail" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs text-slate-500 italic">Upload Thumbnail</span>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: INPUT FORM BOX */}
        <form onSubmit={handleSubmit} className="lg:col-span-3 bg-[#0B1026] border border-white/10 rounded-2xl p-6 flex flex-col justify-between">
          <div className="space-y-5">
            {/* Title Input*/}
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">Advertisement Title</label>
              <input
                type="text" 
                style={shouldShowTitleError ? { borderColor: "#ef4444" } : {}}
                className={`w-full bg-[#111936] border rounded-xl p-3 text-sm text-white focus:outline-none transition-all ${shouldShowTitleError ? "focus:!border-red-500" : "border-white/10 focus:border-blue-500" }`}
                value={form.title}
                onChange={(e) => { 
                  const newVal = e.target.value;
                  setForm({ ...form, title: newVal });
                  
                  if (newVal.trim()) {
                    setErrors((prev) => { const copy = { ...prev }; delete copy.title; return copy; });
                  }
                }}
                onBlur={handleTitleBlur}
              />
              <div className="mt-1">
                {errors.title && hasSubmittedAttempt && <p className="text-xs text-red-400 font-medium">⚠ {errors.title}</p>}
                {!errors.title && !titleAvailable && (hasSubmittedAttempt || isTitleChecked) && <p className="text-xs text-red-400 font-medium">⚠ This title is already taken</p>}
                {titleAvailable && isTitleChecked && form.title.trim() && !errors.title && <p className="text-xs text-green-400 font-medium">✓ Title is verified and available</p>}
              </div>
            </div>

            {/* Video File Input */}
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                {isEditMode ? "Replace Video File (Optional)" : "Advertisement Video File *"}
              </label>
              <div 
                style={shouldShowVideoError ? { borderColor: "#ef4444" } : {}}
                className={`relative border border-dashed rounded-xl bg-[#111936] p-3 text-center cursor-pointer transition-all hover:border-white/20 ${shouldShowVideoError ? "border-red-500 bg-red-500/5" : "border-white/10"}`}
              >
                <input
                  type="file" accept="video/*" className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={(e) => {
                    const file = e.target.files?.[0] ?? null;
                    setForm({ ...form, video: file });
                    if (file) {
                      setVideoPreview(URL.createObjectURL(file));
                      setErrors((prev) => { const copy = { ...prev }; delete copy.video; return copy; });
                    }
                  }}
                />
                <p className="text-xs text-slate-400 truncate">{form.video ? `✓ ${form.video.name}` : "Choose File No file chosen"}</p>
              </div>
              {shouldShowVideoError && <p className="text-xs text-red-500 font-medium mt-1.5">⚠ {errors.video}</p>}
            </div>

            {/* Thumbnail File Input */}
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                {isEditMode ? "Replace Thumbnail (Optional)" : "Advertisement Thumbnail (Optional)"}
              </label>
              <div className="relative border border-dashed border-white/10 hover:border-white/20 rounded-xl bg-[#111936] p-3 text-center cursor-pointer transition-all">
                <input
                  type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={(e) => {
                    const file = e.target.files?.[0] ?? null;
                    setThumbnailFile(file);
                    if (file) setThumbnailPreview(URL.createObjectURL(file));
                  }}
                />
                <p className="text-xs text-slate-400 truncate">{thumbnailFile ? `✓ ${thumbnailFile.name}` : "Choose File No file chosen"}</p>
              </div>
            </div>

            {/* Status Checkbox */}
            <div className="flex items-center gap-3 py-1">
              <input
                type="checkbox" id="active" className="w-5 h-5 rounded bg-[#111936] border-white/10 accent-[#106EE9] cursor-pointer"
                checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })}
              />
              <label htmlFor="active" className="text-sm text-slate-200 cursor-pointer select-none">Active Status (Visible to users)</label>
            </div>
          </div>

          {/* Buttons Area */}
          <div className="flex gap-4 pt-4 border-t border-white/5 mt-8">
            <button type="submit" disabled={isSubmitting} className="flex-1 bg-[#106EE9] py-3 rounded-xl font-bold hover:opacity-90 text-sm transition-all text-white cursor-pointer disabled:opacity-50">
              {isSubmitting ? "Saving..." : isEditMode ? "Save Changes" : "Create Advertisement"}
            </button>
            <button type="button" onClick={() => router.push("/admin/ads")} className="bg-[#F41010] px-6 py-3 rounded-xl font-bold hover:opacity-90 text-sm transition-all text-white cursor-pointer">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}