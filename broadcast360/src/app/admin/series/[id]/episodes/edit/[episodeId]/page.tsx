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

type Series = {
  id: number;
  name: string;
};

export default function EditEpisodePage() {
  const params =
    useParams();

  const router =
    useRouter();

  const episodeId =
    Number(
      params.episodeId,
    );

  const seriesId =
    Number(params.id);

  const [
    episode,
    setEpisode,
  ] = useState<Episode | null>(
    null,
  );

  const [
    series,
    setSeries,
  ] = useState<Series | null>(
    null,
  );

  // =====================================================
  // LOAD EPISODE
  // =====================================================

  useEffect(() => {
    async function loadEpisode() {
      try {
        const res =
          await fetch(
            `/api/series/${seriesId}/episodes/${episodeId}`,
            {
              cache: "no-store",
            },
          );

        if (!res.ok) {
          throw new Error(
            "Episode not found",
          );
        }

        const data: Episode =
          await res.json();

        setEpisode(data);
      } catch (error) {
        console.error(error);
      }
    }

    if (
      Number.isInteger(
        episodeId,
      ) &&
      episodeId > 0 &&
      Number.isInteger(
        seriesId,
      ) &&
      seriesId > 0
    ) {
      void loadEpisode();
    }
  }, [
    episodeId,
    seriesId,
  ]);

  // =====================================================
  // LOAD SERIES
  // =====================================================

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
          name:
            data.name ??
            data.title ??
            "",
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

  // =====================================================
  // LOADING
  // =====================================================

  if (!episode || !series) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="animate-pulse text-sm font-medium text-slate-400">
          Loading episode details...
        </p>
      </div>
    );
  }

  // =====================================================
  // INITIAL DATA
  // =====================================================

  const initialData = {
    title:
      episode.title,

    episodeNo:
      episode.episodeNo,

    videoUrl:
      episode.videoUrl ??
      undefined,

    thumbnailUrl:
      episode.thumbnailUrl ??
      undefined,
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="mx-auto max-w-6xl p-4 text-slate-100 sm:p-6 lg:p-8">

      {/* HEADER */}

      <div className="mb-8 border-b border-slate-800/60 pb-5">
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Edit Episode
        </h1>
      </div>

      {/* FORM */}

      <EpisodeForm
        isEdit={true}
        episodeId={
          episode.id
        }
        seriesId={
          seriesId
        }
        seriesTitle={
          series.name
        }
        defaultValues={
          initialData
        }
        onSubmit={async (
          data,
        ) => {
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

          if (
            data.videoFile
          ) {
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
              `/api/series/${seriesId}/episodes/${episode.id}`,
              {
                method: "PUT",
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
                "Update failed",
            );
          }

          alert(
            "Episode updated successfully",
          );

          router.push(
            `/admin/series/${seriesId}`,
          );

          router.refresh();
        }}
      />
    </div>
  );
}