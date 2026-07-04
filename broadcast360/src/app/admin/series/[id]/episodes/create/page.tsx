"use client";

import { useRouter, useParams } from "next/navigation";
import EpisodeForm from "@/components/admin/episode/EpisodeForm";
import type { EpisodeFormData } from "@/types/episode";

export default function CreateEpisodePage() {
  console.log("What is EpisodeForm?", EpisodeForm);

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

    const res = await fetch(
      `/api/series/${seriesId}/episodes`,
      {
        method: "POST",
        body: formData,
      }
    );

    const result = await res.json();

    if (!res.ok) {
      console.error("Create Episode Error:", result);
      alert(result.message || "Failed to create episode");
      return;
    }

    router.push(`/admin/series/${seriesId}`);
    router.refresh();
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">
        Create Episode
      </h1>

      <EpisodeForm onSubmit={handleSubmit} />
    </div>
  );
}