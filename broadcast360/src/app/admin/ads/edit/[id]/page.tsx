"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AdvertisementForm from "@/components/admin/advertisements/advertisementForm";
import type { AdvertisementFormData } from "@/types/advertisement";

type Advertisement = {
  id: number;
  title: string;
  videoUrl: string;
  duration: number | null;
  active: boolean;
};

export default function EditAdvertisementPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id); 

  const [advertisement, setAdvertisement] = useState<Advertisement | null>(null);

  useEffect(() => {
    async function loadAdvertisement() {
      try {
        const res = await fetch(`/api/ads/${id}`);
        if (!res.ok) throw new Error("Advertisement not found");
        const data: Advertisement = await res.json();
        setAdvertisement(data);
      } catch (err) {
        console.log(err);
      }
    }

    if (id) loadAdvertisement();
  }, [id]);

  if (!advertisement) {
    return <p className="p-6 text-white text-sm animate-pulse">Loading Asset...</p>;
  }

  const initialData: AdvertisementFormData = {
    title: advertisement.title,
    active: advertisement.active,
    video: null, 
  };

  async function handleSubmit(data: AdvertisementFormData) {
    if (!advertisement) return;

    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("active", String(data.active));
    if (data.video) {
      formData.append("video", data.video);
    }

    const res = await fetch(`/api/ads/${advertisement.id}`, {
      method: "PUT",
      body: formData,
    });

    if (res.ok) {
      router.push("/admin/ads");
    }
  }

  return (
    <div className="p-6  text-white">
      <h1 className="text-2xl font-bold mb-5">
        Edit Advertisement
      </h1>

      {/* Video Preview */}
      <div className="mt-10">
        <h2 className="font-semibold">
          PreviewVideo
        </h2>
        <video
          width="250"
          height="250"
          controls
          className="rounded object-cover"
        >
          <source src={advertisement.videoUrl} type="video/mp4" />
          Your browser does not support video.
        </video>
      </div>

      {/* Duration from ffmpeg */}
      <div className="mt-5">
        <p>
          Duration:{" "}
          {advertisement.duration
            ? `${advertisement.duration} seconds`
            : "No duration"}
        </p>
      </div>

      <div className="mt-8">
  <AdvertisementForm
    initialData={initialData}
    advertisementId={advertisement.id}
    onSubmit={async (data) => {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("active", String(data.active));
      if (data.video) {
        formData.append("video", data.video);
      }

      const res = await fetch(`/api/ads/${advertisement.id}`, {
        method: "PUT",
        body: formData,
      });

      if (res.ok) {
        router.push("/admin/ads");
      }
    }}
  />
</div>
    </div>
  );
}