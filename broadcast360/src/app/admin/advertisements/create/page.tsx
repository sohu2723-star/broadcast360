"use client";

import { useRouter } from "next/navigation";
import AdvertisementForm from "@/components/admin/advertisements/advertisementForm";
import type { AdvertisementFormData } from "@/types/advertisement";

export default function CreateAdvertisementPage() {
  const router = useRouter();

  async function handleCreateSubmit(data: AdvertisementFormData) {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("active", String(data.active));
    
    if (data.video) {
      formData.append("video", data.video);
    }

    const res = await fetch("/api/advertisements", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      router.push("/admin/advertisements");
    } else {
      console.error("Failed to create advertisement");
    }
  }

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-5">Create New Advertisement</h1>
      
      <div className="mt-8">
        {/* Passing the missing onSubmit prop here fixes the error */}
        <AdvertisementForm onSubmit={handleCreateSubmit} />
      </div>
    </div>
  );
}