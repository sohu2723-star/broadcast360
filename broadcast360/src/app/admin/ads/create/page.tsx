"use client";

import { useRouter } from "next/navigation";
import AdvertisementForm from "@/components/admin/advertisements/advertisementForm";

export default function CreateAdvertisementPage() {
  const router = useRouter();

  async function handleCreateSubmit(data: any) {
  const formData = new FormData();
  formData.append("title", data.title);
  formData.append("active", String(data.active));
  
  if (data.video) {
    formData.append("video", data.video);
  }

  if (data.thumbnail && data.thumbnail instanceof File) {
    formData.append("thumbnail", data.thumbnail);
  }

  const res = await fetch("/api/ads", {
    method: "POST",
    body: formData,
  });

  if (res.ok) {
    router.push("/admin/ads");
    router.refresh();
  } else {
    const errorData = await res.json().catch(() => ({}));
    console.error("API Error Response From Server:", errorData);
  }
}
  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-5">Create New Advertisement</h1>
      <div className="mt-8">
        <AdvertisementForm onSubmit={handleCreateSubmit} />
      </div>
    </div>
  );
}