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
        const res = await fetch(
          `/api/series/${seriesId}/episodes/${episodeId}`,
        );

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

  if (!episode) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="animate-pulse text-sm font-medium text-slate-400">
          Loading episode details...
        </p>
      </div>
    );
  }

  const initialData = {
    title: episode.title,
    episodeNo: episode.episodeNo,
    videoUrl: episode.videoUrl ?? undefined,
    thumbnailUrl: episode.thumbnailUrl ?? undefined,
  };

  return (
    <div className="mx-auto max-w-6xl p-4 text-slate-100 sm:p-6 lg:p-8">
      {/* HEADER SECTION */}
      <div className="mb-8 border-b border-slate-800/60 pb-5">
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Edit Episode
        </h1>
      </div>

      {/* FORM SECTION (WITHOUT RIGHT PANEL) */}
      <EpisodeForm
        isEdit={true}
        defaultValues={initialData}
        onSubmit={async (data) => {
          try {
            const formData = new FormData();

            formData.append("title", data.title);
            formData.append("episodeNo", String(data.episodeNo));

            if (data.videoFile) {
              formData.append("video", data.videoFile);
            }

            if (data.thumbnailFile) {
              formData.append("thumbnail", data.thumbnailFile);
            }

            const res = await fetch(
              `/api/series/${seriesId}/episodes/${episode.id}`,
              {
                method: "PUT",
                body: formData,
              },
            );

            const result = await res.json();

            if (!res.ok) {
              throw new Error(result.message || "Update failed");
            }

            alert("Episode updated successfully");

            router.push(`/admin/series/${seriesId}`);
            router.refresh();
          } catch (error: unknown) {
            if (error instanceof Error) {
              alert(error.message);
            } else {
              alert("Something went wrong");
            }
          }
        }}
      />
    </div>
  );
}
