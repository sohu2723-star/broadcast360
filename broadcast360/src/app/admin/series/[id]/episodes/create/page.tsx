"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  useParams,
  useRouter,
} from "next/navigation";

import EpisodeForm from "@/components/admin/episode/EpisodeForm";

import type {
  EpisodeFormData,
} from "@/types/episode";
import { uploadAdminFileDirect } from "@/lib/media/direct-upload";

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

type SeriesData = {
  id: number;
  title: string;
};

export default function CreateEpisodePage() {
  const router =
    useRouter();

  const params =
    useParams();

  const seriesId =
    Number(params.id);

  const [
    series,
    setSeries,
  ] = useState<SeriesData | null>(
    null,
  );

  // ===================================================
  // LOAD SERIES
  // ===================================================

  useEffect(() => {
    async function loadSeries() {
      try {
        const res =
          await fetch(
            `/api/series/${seriesId}`,
            {
              cache: "no-store",
            },
          );

        if (!res.ok) {
          throw new Error(
            "Series not found",
          );
        }

        const result =
          await res.json();

        const data =
          result.data ??
          result;

        setSeries({
          id: data.id,
          title: data.title,
        });
      } catch (error) {
        console.error(error);
      }
    }

    if (
      Number.isInteger(
        seriesId,
      ) &&
      seriesId > 0
    ) {
      void loadSeries();
    }
  }, [seriesId]);

  // ===================================================
  // LOADING
  // ===================================================

  if (!series) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="animate-pulse text-sm font-medium text-slate-400">
          Loading series...
        </p>
      </div>
    );
  }

  // ===================================================
  // SUBMIT
  // ===================================================

  async function handleSubmit(
    data: EpisodeFormData,
  ) {
    if (!data.videoFile) {
      throw new Error("Video file is required");
    }

    const [videoUpload, thumbnailUpload, duration] = await Promise.all([
      uploadAdminFileDirect(data.videoFile, "videos/episodes"),
      data.thumbnailFile
        ? uploadAdminFileDirect(data.thumbnailFile, "thumbnails/episodes")
        : Promise.resolve(null),
      getVideoDuration(data.videoFile),
    ]);

    const formData = new FormData();
    formData.append("title", data.title.trim());
    formData.append("episodeNo", String(data.episodeNo));
    formData.append("accessType", data.accessType ?? "FREE");
    formData.append("videoUrl", videoUpload.publicUrl);
    formData.append("duration", String(duration));
    if (thumbnailUpload) formData.append("thumbnailUrl", thumbnailUpload.publicUrl);

    const res =
      await fetch(
        `/api/series/${seriesId}/episodes`,
        {
          method: "POST",
          body: formData,
        },
      );

    let result: {
      message?: string;
    } = {};

    try {
      result =
        await res.json();
    } catch {
      result = {};
    }

    if (!res.ok) {
      throw new Error(
        result.message ||
          "Failed to create episode",
      );
    }

    router.push(
      `/admin/series/${seriesId}`,
    );

    router.refresh();
  }

  // ===================================================
  // UI
  // ===================================================

  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold text-white">
        Create Episode
      </h1>

      <EpisodeForm
        seriesTitle={
          series.title
        }
        seriesId={
          series.id
        }
        isEdit={false}
        onSubmit={
          handleSubmit
        }
      />
    </div>
  );
}