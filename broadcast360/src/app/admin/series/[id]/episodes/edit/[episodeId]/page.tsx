"use client";
import Image from "next/image";
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

  if (!episode) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-slate-400 animate-pulse text-sm font-medium">Loading episode details...</p>
      </div>
    );
  }

  const initialData = {
    title: episode.title,
    episodeNo: episode.episodeNo,
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 text-slate-100">
      
      {/* HEADER SECTION */}
      <div className="mb-8 border-b border-slate-800/60 pb-5">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
          Edit Episode
        </h1>
      </div>

      {/* TWO-COLUMN GRID RESPONSIVE LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: THE INPUT FIELDS FORM */}
        <div className="lg:col-span-7 bg-[#0f1524] rounded-2xl border border-slate-800 p-6 shadow-xl">
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
                  }
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

        {/* RIGHT COLUMN: VISUAL MEDIA PREVIEWS */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* THUMBNAIL PREVIEW */}
          {episode.thumbnailUrl && (
            <div className="bg-[#0f1524] rounded-2xl border border-slate-800 p-5 shadow-lg">
              <h2 className="mb-3 text-sm font-semibold text-slate-400 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                Current Thumbnail
              </h2>
              <div className="relative rounded-xl overflow-hidden border border-slate-700/50 aspect-video w-full max-w-[400px]">
                <Image
                  src={episode.thumbnailUrl}
                  alt={`${episode.title} thumbnail`}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            </div>
          )}

          {/* VIDEO PREVIEW */}
          <div className="bg-[#0f1524] rounded-2xl border border-slate-800 p-5 shadow-lg">
            <h2 className="mb-3 text-sm font-semibold text-slate-400 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
              Video Preview
            </h2>
            <div className="rounded-xl overflow-hidden border border-slate-700/50 aspect-video bg-black/40 w-full max-w-[400px]">
              <video
                controls
                className="w-full h-full object-contain focus:outline-none"
              >
                <source src={episode.videoUrl ?? ""} type="video/mp4" />
                Your browser does not support video.
              </video>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}