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
    const formData =
      new FormData();

    // =================================================
    // TITLE
    // =================================================

    formData.append(
      "title",
      data.title.trim(),
    );

    // =================================================
    // EPISODE NUMBER
    // =================================================

    formData.append(
      "episodeNo",
      String(
        data.episodeNo,
      ),
    );

    // =================================================
    // VIDEO
    // =================================================

    if (data.videoFile) {
      formData.append(
        "video",
        data.videoFile,
      );
    }

    // =================================================
    // THUMBNAIL
    // =================================================

    if (
      data.thumbnailFile
    ) {
      formData.append(
        "thumbnail",
        data.thumbnailFile,
      );
    }

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