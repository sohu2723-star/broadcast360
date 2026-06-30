"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AdvertisementFormData } from "@/types/advertisement";
import {
  createAdvertisementSchema,
  editAdvertisementSchema,
} from "@/lib/validators/advertisement.validator";

type Props = {
  initialData?: AdvertisementFormData;
  advertisementId?: number;
  onSubmit: (data: AdvertisementFormData) => Promise<void>;
};

export default function AdvertisementForm({
  initialData,
  advertisementId,
  onSubmit,
}: Props) {
  const router = useRouter();
  const isEditMode = !!advertisementId;

  const [form, setForm] = useState<AdvertisementFormData>(
    initialData ?? {
      title: "",
      active: true,
      video: null,
    }
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isCheckingTitle, setIsCheckingTitle] = useState(false);
  const [titleAvailable, setTitleAvailable] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  //On blur validation for title availability
  async function handleTitleBlur() {
  const trimmedTitle = form.title.trim();
  setTitleAvailable(false);

  if (!trimmedTitle) {
    setErrors((prev) => ({ ...prev, title: "Advertisement title is required" }));
    return;
  }

  const isSameAsOriginal = isEditMode && 
    initialData?.title && 
    trimmedTitle.toLowerCase().replace(/\s+/g, " ") === initialData.title.trim().toLowerCase().replace(/\s+/g, " ");

  if (isSameAsOriginal) {
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy.title;
      return copy;
    });
    setTitleAvailable(true);
    return; 
  }

  try {
    const currentId = (form as any).id || (initialData as any)?.id || ""; 
    const url = `/api/advertisements/check-title?title=${encodeURIComponent(trimmedTitle)}&id=${currentId}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.exists) {
      setErrors((prev) => ({ ...prev, title: "This title is already taken" }));
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
    console.error("Blur Check Error:", err);
  }
}

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();
  
  setTitleAvailable(false);
  setErrors({});

  if (errors.title || !form.title.trim()) return;

  const schema = isEditMode ? editAdvertisementSchema : createAdvertisementSchema;
  const result = schema.safeParse(form);

  if (!result.success) {
    const fieldErrors: Record<string, string> = {};
    result.error.issues.forEach((issue) => {
      const field = issue.path[0] as string;
      if (field) {
        fieldErrors[field] = issue.message;
      }
    });
    setErrors(fieldErrors);
    return;
  }

  try {
    setIsSubmitting(true);
    const trimmedTitle = form.title.trim();

    const isSameAsOriginal = isEditMode && 
      initialData?.title && 
      trimmedTitle.toLowerCase().replace(/\s+/g, " ") === initialData.title.trim().toLowerCase().replace(/\s+/g, " ");

    if (!isSameAsOriginal) {
      const currentId = (form as any).id || (initialData as any)?.id || ""; 
      const url = `/api/advertisements/check-title?title=${encodeURIComponent(trimmedTitle)}&id=${currentId}`;
      
      const res = await fetch(url);
      const data = await res.json();

      if (data.exists) {
        setErrors((prev) => ({ ...prev, title: "This title is already taken" }));
        setIsSubmitting(false);
        return; 
      } else {
        setTitleAvailable(true);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    } else {
      setTitleAvailable(true);
    }

    await onSubmit(form);
    
  } catch (err) {
    console.error(err);
  } finally {
    setIsSubmitting(false);
  }
}

  return (
    <div className="bg-[#0B1026] border border-white/10 rounded-2xl p-6 w-full">
      <form className="space-y-5" onSubmit={handleSubmit}>
        
        {/* Title Input */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-slate-200">
              Advertisement Title
            </label>
            {isCheckingTitle && (
              <span className="text-xs text-blue-400 animate-pulse">Checking...</span>
            )}
          </div>
          
        <input
              type="text" style={errors.title ? { borderColor: "#ef4444" } : {}}
              className={`w-full bg-[#111936] border rounded-xl p-3 text-white focus:outline-none transition-all 
                ${errors.title ? "focus:!border-red-500" : "border-white/10 focus:border-blue-500" }`}
              value={form.title}
              onChange={(e) => {
                                  setTitleAvailable(false); 
                                  
                                  setForm({ ...form, title: e.target.value });
                                  if (errors.title) {
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
          {errors.title && (
            <p style={{ color: "#ef4444" }} className="text-sm text-red-500">{errors.title}</p>
          )}
          
          {titleAvailable && !errors.title && (
            <p style={{ color: "#10b981" }} className="text-sm text-green-500 font-medium">✓ Title is available</p>
          )}
        </div>
        </div>

        {/* Compact File Upload Area */}
        <div>
          <label className="block text-sm font-medium text-slate-200 mb-2">
            {isEditMode ? "Replace Video File (Optional)" : "Advertisement Video File"}
          </label>
          <div className="relative border border-dashed border-white/10 hover:border-white/20 rounded-xl bg-[#111936] p-4 text-center cursor-pointer transition-all">
            <input
              type="file"
              accept="video/*"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                setForm({ ...form, video: file });
              }}
            />
            <div className="text-xs text-slate-400 space-y-1">
              {form.video ? (
                <p className="text-emerald-400 font-medium truncate">✓ {form.video.name}</p>
              ) : (
                <p>Click or drag to upload video file</p>
              )}
            </div>
          </div>
          {errors.video && (
            <p style={{ color: "#ef4444" }} className="text-xs font-semibold mt-2">⚠ {errors.video}</p>
          )}
          
        </div>

        {/* Active Status Checkbox */}
        <div className="flex items-center gap-3 py-1">
          <input
            type="checkbox"
            id="active"
            className="w-5 h-5 rounded bg-[#111936] border-white/10 accent-[#106EE9] cursor-pointer"
            checked={form.active}
            onChange={(e) => setForm({ ...form, active: e.target.checked })}
          />
          <label htmlFor="active" className="text-sm text-slate-200 cursor-pointer select-none">
            Active Status (Visible to users)
          </label>
        </div>

        {/* Buttons Control */}
        <div className="flex gap-4 mt-5 pt-2">
           <button type="submit"
                   disabled={isCheckingTitle || isSubmitting || !!errors.title}
                    style={{
                      opacity: (isCheckingTitle || isSubmitting || !!errors.title) ? 0.4 : 1,
                      cursor: (isCheckingTitle || isSubmitting || !!errors.title) ? "not-allowed" : "pointer"
                    }}
                   className="flex-1 bg-[#106EE9] py-3 rounded-xl font-bold hover:opacity-90 text-sm transition-all text-white"
              >
            {isSubmitting ? "Saving..." : isEditMode ? "Update Advertisement" : "Create Advertisement"}
           </button>
  
            <button
              type="button"
              onClick={() => router.push("/admin/advertisements")}
              className="bg-[#F41010] px-6 py-3 rounded-xl font-bold hover:opacity-90 text-sm transition-all text-white"
            >
              Cancel
            </button>
          </div>
      </form>
    </div>
  );
}