"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import AdvertisementForm from "@/components/admin/advertisements/advertisementForm";

type AdvertisementFormPayload = {
  title: string;
  active: boolean;
  video?: File | null;
  thumbnail: File | null;
};

export default function CreateAdvertisementPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  async function handleCreateSubmit(data: AdvertisementFormPayload) {
    setError("");

    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("active", String(data.active));

    if (data.video) formData.append("video", data.video);
    if (data.thumbnail) formData.append("thumbnail", data.thumbnail);

    try {
      const res = await fetch("/api/ads", {
        method: "POST",
        body: formData,
      });
      const result = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(result.message || result.error || "Advertisement creation failed");
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
