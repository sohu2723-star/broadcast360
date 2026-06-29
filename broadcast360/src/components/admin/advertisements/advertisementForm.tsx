"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

interface AdvertisementFormProps {
  initialData?: {
    title: string;
    active: boolean;
  };
}

export default function AdvertisementForm({ initialData }: AdvertisementFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialData?.title || "");
  const [active, setActive] = useState(initialData?.active ?? true);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingTitle, setIsCheckingTitle] = useState(false); // Title စစ်နေချိန် Loading ပြရန်
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);

  // Blur validation
  const handleTitleBlur = async () => {
    if (!title.trim()) return;
    setIsCheckingTitle(true);
    try {
      const res = await fetch(`/api/advertisements/check-title?title=${encodeURIComponent(title.trim())}`);
      const data = await res.json();

      if (data.exists) {
        setErrors((prev) => ({
          ...prev,
          title: ["This advertisement title is already taken. Please use a unique title."],
        }));
      } else {
        setErrors((prev) => {
          const { title, ...rest } = prev;
          return rest;
        });
      }
    } catch (err) {
      console.error("Failed to check title unique status", err);
    } finally {
      setIsCheckingTitle(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setVideoFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    
    if (errors.title) {
      setGlobalError("Please fix the errors before submitting.");
      return;
    }

    setIsSubmitting(true);
    setErrors({});
    setGlobalError(null);
    setUploadProgress(10);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("active", String(active));
      if (videoFile) {
        formData.append("videoFile", videoFile);
      }
//loading bar progress
      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/advertisements", true);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(Math.min(Math.round(percentComplete * 0.9), 90));
        }
      };

      xhr.onload = () => {
        const response = JSON.parse(xhr.responseText);
        if (xhr.status === 200 || xhr.status === 201) {
          setUploadProgress(100);
          setTimeout(() => {
            router.push("/admin/advertisements");
            router.refresh();
          }, 1000);
        } else if (xhr.status === 400 && response.errors) {
          setErrors(response.errors.fieldErrors || response.errors || {});
          setGlobalError(response.message || "Validation failed");
          setIsSubmitting(false);
        } else {
          setGlobalError(response.message || "Something went wrong.");
          setIsSubmitting(false);
        }
      };

      xhr.onerror = () => {
        setGlobalError("Network error occurred.");
        setIsSubmitting(false);
      };

      xhr.send(formData);
    } catch (err) {
      setGlobalError("An unexpected error occurred.");
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl bg-slate-900 p-6 rounded-xl border border-slate-800 text-white">
      {globalError && (
        <div className="p-4 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-lg text-sm">
          {globalError}
        </div>
      )}

      {/* Title Field */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-slate-300">Advertisement Title</label>
          {isCheckingTitle && <span className="text-xs text-indigo-400 animate-pulse">Checking uniqueness...</span>}
        </div>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleTitleBlur} //blur validation
          placeholder="e.g. Summer Promotion"
          className={`w-full p-3 bg-slate-950 border rounded-lg focus:outline-none transition ${
            errors.title ? "border-rose-500 focus:border-rose-500" : "border-slate-800 focus:border-indigo-500"
          }`}
          disabled={isSubmitting}
        />
        {errors.title && <p className="text-rose-400 text-xs mt-1">{errors.title[0]}</p>}
      </div>

      {/* Video File Field */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Video File</label>
        <input
          type="file"
          accept="video/*"
          onChange={handleFileChange}
          className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer"
          disabled={isSubmitting}
        />
        {errors.videoFile && <p className="text-rose-400 text-xs mt-1">{errors.videoFile[0]}</p>}
      </div>

      {/* Active Status */}
      <div className="flex items-center space-x-3">
        <input
          type="checkbox"
          id="active"
          checked={active}
          onChange={(e) => setActive(e.target.checked)}
          className="w-5 h-5 rounded border-slate-800 text-indigo-600 bg-slate-950 focus:ring-indigo-500"
          disabled={isSubmitting}
        />
        <label htmlFor="active" className="text-sm font-medium text-slate-300 select-none cursor-pointer">
          Active Status
        </label>
      </div>

      {isSubmitting && (
        <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
          <div className="bg-indigo-500 h-2.5 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
          <p className="text-right text-xs text-indigo-400 mt-1">
            {uploadProgress < 90 ? `Uploading... ${uploadProgress}%` : "Processing video with FFmpeg..."}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end space-x-4 pt-4 border-t border-slate-800">
        <button
          type="button"
          onClick={() => router.push("/admin/advertisements")}
          className="px-5 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium disabled:opacity-50"
          disabled={isSubmitting || !!errors.title}//same title disabled button
        >
          {isSubmitting ? "Saving..." : "Save Advertisement"}
        </button>
      </div>
    </form>
  );
}