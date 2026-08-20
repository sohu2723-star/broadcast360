"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import AdvertisementForm from "@/components/admin/advertisements/advertisementForm";
import { uploadAdminFileDirect } from "@/lib/media/direct-upload";

type AdvertisementFormPayload = {
  title: string;
  active: boolean;
  video?: File | null;
  thumbnail: File | null;
};

function getVideoDuration(file: File) {
  return new Promise<number>((resolve) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      const duration = Number.isFinite(video.duration) ? video.duration : 0;
      URL.revokeObjectURL(url);
      resolve(Math.max(0, Math.round(duration)));
    };
    video.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(0);
    };
    video.src = url;
  });
}

export default function CreateAdvertisementPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  async function handleCreateSubmit(data: AdvertisementFormPayload) {
    setError("");

    try {
      if (!data.video) throw new Error("Advertisement video file is required");

      const [videoUpload, thumbnailUpload, duration] = await Promise.all([
        uploadAdminFileDirect(data.video, "videos/ads"),
        data.thumbnail
          ? uploadAdminFileDirect(data.thumbnail, "thumbnails/ads")
          : Promise.resolve(null),
        getVideoDuration(data.video),
      ]);

      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("active", String(data.active));
      formData.append("videoUrl", videoUpload.publicUrl);
      formData.append("duration", String(duration));
      if (thumbnailUpload) formData.append("thumbnailUrl", thumbnailUpload.publicUrl);

      const res = await fetch("/api/ads", {
        method: "POST",
        body: formData,
      });
      const result = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(result.message || result.error || `Advertisement create failed (HTTP ${res.status})`);
      }

      router.push("/admin/ads");
      router.refresh();
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Advertisement creation failed";
      console.error("Advertisement create error:", cause);
      setError(message);
    }
  }

  return (
    <div className="p-6 text-white">
      <h1 className="mb-5 text-2xl font-bold">Create New Advertisement</h1>
      {error && (
        <div role="alert" className="mb-5 rounded-xl border border-red-400/30 bg-red-950/40 p-4 text-sm text-red-200">
          {error}
        </div>
      )}
      <div className="mt-8">
        <AdvertisementForm onSubmit={handleCreateSubmit} />
      </div>
    </div>
  );
}
