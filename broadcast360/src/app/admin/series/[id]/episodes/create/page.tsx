"use client";

import { useRouter, useParams } from "next/navigation";
import EpisodeForm from "@/components/admin/episode/EpisodeForm";
import type { EpisodeFormData } from "@/types/episode";

export default function CreateEpisodePage() {
  const router = useRouter();
  const params = useParams();

  const seriesId = Number(params.id);

  async function handleSubmit(data: EpisodeFormData) {
    const formData = new FormData();

    formData.append("title", data.title);
    formData.append("episodeNo", String(data.episodeNo));
    formData.append("seriesId", String(seriesId));

    if (data.videoFile) {
      formData.append("video", data.videoFile);
    }
    if (data.thumbnailFile) {
      formData.append("thumbnail", data.thumbnailFile);
    }

    const res = await fetch(`/api/series/${seriesId}/episodes`, {
      method: "POST",
      body: formData,
    });

    let result;

    try {
      result = await res.json();
    } catch {
      result = {};
    }

    if (!res.ok) {
      alert(result?.message || "Failed to create episode");
      return;
    }
    router.push(`/admin/series/${seriesId}`);
    router.refresh();
  }

  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold text-white">Create Episode</h1>

      <EpisodeForm onSubmit={handleSubmit} />
    </div>
  );
}
