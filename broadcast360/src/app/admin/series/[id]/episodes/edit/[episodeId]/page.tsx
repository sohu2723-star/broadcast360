"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import EpisodeForm from "@/components/admin/episode/EpisodeForm";


type Episode = {
  id: number;
  seriesId: number;
  title: string;
  episodeNo: number;
  videoUrl: string | null;
  thumbnailUrl: string | null;
  duration: number;
  createdAt: string;
};

export default function EditEpisodePage() {
  const params = useParams();
  const router = useRouter();

  const episodeId = Number(params.episodeId);
  const seriesId = Number(params.id);

  const [episode, setEpisode] = useState<Episode | null>(null);

  useEffect(() => {
    async function loadEpisode() {
      try {
        const res = await fetch(`/api/series/${seriesId}/episodes/${episodeId}`);

        if (!res.ok) {
          throw new Error("Episode not found");
        }

        const data: Episode = await res.json();
        setEpisode(data);
      } catch (err) {
        console.log(err);
      }
    }

    if (episodeId) {
      loadEpisode();
    }
  }, [episodeId, seriesId]);

  if (!episode) return <p>Loading...</p>;

  const initialData = {
    title: episode.title,
    episodeNo: episode.episodeNo,
  };

  return (
    <div className="p-6">

      <h1 className="text-2xl font-bold mb-5">
        Edit Episode
      </h1>

      {/* Video Preview */}
      <div>
        <h2 className="font-semibold">Video</h2>

        <video
          width="600"
          controls
          className="rounded"
        >
          <source src={episode.videoUrl ?? ""} type="video/mp4" />
          Your browser does not support video.
        </video>
      </div>

  

      <EpisodeForm
  isEdit={true}
  defaultValues={initialData}
  onSubmit={async (data) => {
    await fetch(`/api/series/${seriesId}/episodes/${episode.id}`, {
      method: "PUT",
      body: (() => {
        const formData = new FormData();

        formData.append("title", data.title);
        formData.append("episodeNo", String(data.episodeNo));

        if (data.videoFile) {
          formData.append("video", data.videoFile);
        }

        return formData;
      })(),
    });

    router.push(`/admin/series/${seriesId}`);
    router.refresh();
  }}
/>

    </div>
  );
}