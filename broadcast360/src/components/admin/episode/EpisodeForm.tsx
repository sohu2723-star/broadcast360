"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import {
  createEpisodeSchema,
  editEpisodeSchema,
} from "@/lib/validators/episode.validator";

import type {
  EpisodeFormData,
} from "@/types/episode";

import ImageUploader from "@/components/ImageUploader";

// =====================================================
// TYPES
// =====================================================

type EpisodeFromAPI = {
  id: number;
  title: string;
  episodeNo: number;
};

type Props = {
  seriesTitle?: string;
  seriesId?: number;
  episodeId?: number;

  defaultValues?: {
    title?: string;
    episodeNo?: number;
    videoUrl?: string;
    thumbnailUrl?: string;
    accessType?: "FREE" | "PREMIUM";
  };

  isEdit?: boolean;

  onSubmit: (
    data: EpisodeFormData,
  ) => Promise<void>;
};

// =====================================================
// GET PART NUMBER
// =====================================================

function getPartFromTitle(
  title: string,
): number {
  const match = title.match(
    /-\s*Part\s+(\d+)\s*$/i,
  );

  if (!match) {
    return 0;
  }

  const part = Number(match[1]);

  if (
    !Number.isInteger(part) ||
    part < 1
  ) {
    return 0;
  }

  return part;
}

// =====================================================
// COMPONENT
// =====================================================

export default function EpisodeForm({
  seriesTitle = "",
  seriesId,
  episodeId,
  defaultValues,
  isEdit = false,
  onSubmit,
}: Props) {
  const router = useRouter();

  // ===================================================
  // VIDEO PREVIEW
  // ===================================================

  const [
    videoPreviewUrl,
    setVideoPreviewUrl,
  ] = useState<string | null>(
    defaultValues?.videoUrl ?? null,
  );

  // ===================================================
  // FORM STATE
  // ===================================================

  const [
    form,
    setForm,
  ] = useState<EpisodeFormData>(() => ({
    title:
      defaultValues?.title?.trim() ||
      "",

    episodeNo:
      defaultValues?.episodeNo ?? 1,

    videoFile: null,

    thumbnailFile: null,
    accessType: defaultValues?.accessType ?? "FREE",
  }));

  // ===================================================
  // TITLE MANUALLY EDITED
  // ===================================================

  const [
    titleManuallyEdited,
    setTitleManuallyEdited,
  ] = useState<boolean>(() =>
    Boolean(
      defaultValues?.title?.trim(),
    ),
  );

  // ===================================================
  // ERRORS
  // ===================================================

  const [
    errors,
    setErrors,
  ] = useState<
    Record<string, string>
  >({});

  // ===================================================
  // EPISODES
  // ===================================================

  const [
    episodes,
    setEpisodes,
  ] = useState<EpisodeFromAPI[]>(
    [],
  );

  const [
    loadingEpisodes,
    setLoadingEpisodes,
  ] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // ===================================================
  // LOAD EPISODES
  // ===================================================

  useEffect(() => {
    if (
      !seriesId ||
      seriesId < 1
    ) {
      return;
    }

    let cancelled = false;

    async function loadEpisodes() {
      setLoadingEpisodes(true);

      try {
        const response =
          await fetch(
            `/api/series/${seriesId}/episodes`,
            {
              cache: "no-store",
            },
          );

        if (!response.ok) {
          throw new Error(
            "Failed to fetch episodes",
          );
        }

        const data =
          await response.json();

        if (cancelled) {
          return;
        }

        if (Array.isArray(data)) {
          setEpisodes(
            data as EpisodeFromAPI[],
          );
        } else {
          setEpisodes([]);
        }
      } catch (error) {
        console.error(
          "Load episodes error:",
          error,
        );

        if (!cancelled) {
          setEpisodes([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingEpisodes(false);
        }
      }
    }

    void loadEpisodes();

    return () => {
      cancelled = true;
    };
  }, [seriesId]);

  // ===================================================
  // AUTO PART NUMBER
  // ===================================================

  const previewPartNumber =
    useMemo(() => {
      const targetEpisodeNo =
        Number(form.episodeNo);

      if (
        !Number.isInteger(
          targetEpisodeNo,
        ) ||
        targetEpisodeNo < 1
      ) {
        return 1;
      }

      // -------------------------------------------------
      // EDIT
      //
      // Same episode number:
      // Keep current part.
      // -------------------------------------------------

      if (
        isEdit &&
        episodeId &&
        defaultValues?.episodeNo ===
          targetEpisodeNo
      ) {
        const currentPart =
          getPartFromTitle(
            defaultValues?.title ?? "",
          );

        if (currentPart > 0) {
          return currentPart;
        }
      }

      // -------------------------------------------------
      // Find same episode number
      // -------------------------------------------------

      const targetEpisodes =
        episodes.filter(
          (episode) =>
            Number(
              episode.episodeNo,
            ) === targetEpisodeNo,
        );

      // -------------------------------------------------
      // Remove current episode
      // -------------------------------------------------

      const otherEpisodes =
        isEdit && episodeId
          ? targetEpisodes.filter(
              (episode) =>
                Number(
                  episode.id,
                ) !==
                Number(episodeId),
            )
          : targetEpisodes;

      // -------------------------------------------------
      // Used parts
      // -------------------------------------------------

      const usedParts =
        new Set<number>();

      for (
        const episode of otherEpisodes
      ) {
        const part =
          getPartFromTitle(
            episode.title,
          );

        if (part > 0) {
          usedParts.add(part);
        }
      }

      // -------------------------------------------------
      // Find first available part
      //
      // []       -> 1
      // [1]      -> 2
      // [1,2]    -> 3
      // [1,3]    -> 2
      // -------------------------------------------------

      let nextPart = 1;

      while (
        usedParts.has(nextPart)
      ) {
        nextPart++;
      }

      return nextPart;
    }, [
      episodes,
      form.episodeNo,
      isEdit,
      episodeId,
      defaultValues?.title,
      defaultValues?.episodeNo,
    ]);

  // ===================================================
  // AUTO TITLE
  // ===================================================

  const autoTitle =
    useMemo(() => {
      if (!seriesTitle) {
        return `Part ${previewPartNumber}`;
      }

      return `${seriesTitle} - Part ${previewPartNumber}`;
    }, [
      seriesTitle,
      previewPartNumber,
    ]);

  // ===================================================
  // DISPLAY TITLE
  //
  // IMPORTANT:
  //
  // We DON'T call setForm() from useEffect.
  //
  // Auto title is calculated during render.
  // ===================================================

  const displayTitle =
    titleManuallyEdited
      ? form.title
      : form.title.trim()
        ? form.title
        : autoTitle;

  // ===================================================
  // VIDEO PREVIEW CLEANUP
  // ===================================================

  useEffect(() => {
    return () => {
      if (
        videoPreviewUrl &&
        videoPreviewUrl.startsWith(
          "blob:",
        )
      ) {
        URL.revokeObjectURL(
          videoPreviewUrl,
        );
      }
    };
  }, [videoPreviewUrl]);

  // ===================================================
  // TITLE CHANGE
  // ===================================================

  function handleTitleChange(
    e: React.ChangeEvent<HTMLInputElement>,
  ) {
    const value =
      e.target.value;

    setTitleManuallyEdited(true);

    setForm(
      (prev) => ({
        ...prev,
        title: value,
      }),
    );

    if (errors.title) {
      setErrors(
        (prev) => {
          const next = {
            ...prev,
          };

          delete next.title;

          return next;
        },
      );
    }
  }

  // ===================================================
  // EPISODE NUMBER CHANGE
  // ===================================================

  function handleEpisodeNumberChange(
    e: React.ChangeEvent<HTMLInputElement>,
  ) {
    const rawValue =
      e.target.value;

    const value =
      rawValue === ""
        ? 1
        : Number(rawValue);

    const nextEpisodeNo =
      Number.isFinite(value)
        ? value
        : 1;

    setForm(
      (prev) => ({
        ...prev,
        episodeNo:
          nextEpisodeNo,
      }),
    );

    // -------------------------------------------------
    // CREATE MODE
    //
    // If title was automatically generated,
    // allow displayTitle to use the new auto title.
    //
    // We DON'T set title here.
    // -------------------------------------------------

    if (
      !isEdit &&
      !titleManuallyEdited
    ) {
      setForm(
        (prev) => ({
          ...prev,
          episodeNo:
            nextEpisodeNo,
          title: "",
        }),
      );
    }

    if (errors.episodeNo) {
      setErrors(
        (prev) => {
          const next = {
            ...prev,
          };

          delete next.episodeNo;

          return next;
        },
      );
    }
  }

  // ===================================================
  // VIDEO CHANGE
  // ===================================================

  function handleVideoChange(
    e: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file =
      e.target.files?.[0] ??
      null;

    setForm(
      (prev) => ({
        ...prev,
        videoFile: file,
      }),
    );

    if (
      videoPreviewUrl &&
      videoPreviewUrl.startsWith(
        "blob:",
      )
    ) {
      URL.revokeObjectURL(
        videoPreviewUrl,
      );
    }

    if (file) {
      const url =
        URL.createObjectURL(
          file,
        );

      setVideoPreviewUrl(
        url,
      );
    } else {
      setVideoPreviewUrl(
        defaultValues?.videoUrl ??
          null,
      );
    }

    if (errors.videoFile) {
      setErrors(
        (prev) => {
          const next = {
            ...prev,
          };

          delete next.videoFile;

          return next;
        },
      );
    }
  }

  // ===================================================
  // DUPLICATE TITLE
  // ===================================================

  function findDuplicateTitle(
    title: string,
    episodeNo: number,
  ) {
    const normalizedTitle =
      title
        .trim()
        .toLowerCase();

    if (!normalizedTitle) {
      return null;
    }

    return episodes.find(
      (episode) => {
        const sameTitle =
          episode.title
            .trim()
            .toLowerCase() ===
          normalizedTitle;

        const sameEpisodeNo =
          Number(
            episode.episodeNo,
          ) === episodeNo;

        const isCurrentEpisode =
          isEdit &&
          episodeId &&
          Number(
            episode.id,
          ) ===
            Number(episodeId);

        return (
          sameTitle &&
          sameEpisodeNo &&
          !isCurrentEpisode
        );
      },
    );
  }

  // ===================================================
  // SUBMIT
  // ===================================================

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>,
  ) {
    e.preventDefault();

    // -------------------------------------------------
    // TITLE
    //
    // User title if provided.
    // Otherwise auto title.
    // -------------------------------------------------

    const cleanTitle =
      form.title.trim() ||
      autoTitle;

    const submitForm: EpisodeFormData = {
      ...form,
      title: cleanTitle,
    };

    // -------------------------------------------------
    // VALIDATION
    // -------------------------------------------------

    const schema =
      isEdit
        ? editEpisodeSchema
        : createEpisodeSchema;

    const result =
      schema.safeParse(
        submitForm,
      );

    if (!result.success) {
      const fieldErrors: Record<
        string,
        string
      > = {};

      for (
        const issue of result.error.issues
      ) {
        const field =
          issue.path[0];

        if (
          typeof field ===
          "string"
        ) {
          fieldErrors[field] =
            issue.message;
        }
      }

      setErrors(
        fieldErrors,
      );

      return;
    }

    // -------------------------------------------------
    // WAIT
    // -------------------------------------------------

    if (loadingEpisodes) {
      setErrors({
        title:
          "Please wait while episode titles are being checked.",
      });

      return;
    }

    // -------------------------------------------------
    // DUPLICATE
    // -------------------------------------------------

    const duplicate =
      findDuplicateTitle(
        cleanTitle,
        form.episodeNo,
      );

    if (duplicate) {
      setErrors({
        title:
          "This episode title already exists.",
      });

      return;
    }

    // -------------------------------------------------
    // CLEAR ERRORS
    // -------------------------------------------------

    setErrors({});

    // -------------------------------------------------
    // SUBMIT
    // -------------------------------------------------

    try {
      setIsSubmitting(true);
      await onSubmit(result.data as EpisodeFormData);
    } catch (error) {
      console.error("Episode submit error:", error);
      setErrors({
        submit:
          error instanceof Error
            ? error.message
            : "Unable to save episode. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  // ===================================================
  // RETURN
  // ===================================================

  return (
    <div className="w-full rounded-2xl border border-white/10 bg-[#1f1f1f] p-8 text-white">
      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">

          {/* =================================================
              LEFT
          ================================================= */}

          <div className="space-y-5">

            {/* TITLE */}

            <div>
              <label className="mb-2 block font-medium">
                Episode Title
              </label>

              <input
                type="text"
                value={displayTitle}
                onChange={
                  handleTitleChange
                }
                placeholder={
                  autoTitle
                }
                className="w-full rounded-xl border border-white/10 bg-[#171717] p-3 text-white focus:border-white/45 focus:outline-none"
              />

              <p className="mt-1 text-xs text-slate-500">
                Episode title is generated automatically, but you can edit it.
              </p>

              {loadingEpisodes && (
                <p className="mt-1 text-xs text-blue-400">
                  Checking available part...
                </p>
              )}

              {errors.title && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.title}
                </p>
              )}
            </div>

            {/* EPISODE NUMBER */}

            <div>
              <label className="mb-2 block font-medium">
                Episode Number
              </label>

              <input
                type="number"
                min={1}
                value={
                  form.episodeNo
                }
                onChange={
                  handleEpisodeNumberChange
                }
                className="w-full rounded-xl border border-white/10 bg-[#171717] p-3 text-white focus:border-white/45 focus:outline-none"
              />

              {errors.episodeNo && (
                <p className="mt-1 text-sm text-red-500">
                  {
                    errors.episodeNo
                  }
                </p>
              )}
            </div>

            {/* ACCESS TIER */}

            <div>
              <label className="mb-2 block font-medium">Access Tier</label>
              <select
                value={form.accessType}
                onChange={(event) => setForm((previous) => ({ ...previous, accessType: event.target.value as "FREE" | "PREMIUM" }))}
                className="w-full rounded-xl border border-white/10 bg-[#171717] p-3 text-white outline-none transition focus:border-white/45"
              >
                <option value="FREE" className="bg-[#171717]">Free — Standard viewing</option>
                <option value="PREMIUM" className="bg-[#171717]">Premium — HD, schedule, and download</option>
              </select>
            </div>

            {/* VIDEO */}

            <div>
              <label className="mb-2 block font-medium">
                Video File
              </label>

              <input
                type="file"
                accept="video/*"
                onChange={
                  handleVideoChange
                }
                className="w-full rounded-xl border border-white/10 bg-[#171717] p-3 text-white file:mr-4 file:rounded-lg file:border-0 file:bg-white/10 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-white hover:file:bg-white/20 focus:border-white/45 focus:outline-none"
              />

              {errors.videoFile && (
                <p className="mt-1 text-sm text-red-500">
                  {
                    errors.videoFile
                  }
                </p>
              )}

              {videoPreviewUrl && (
                <div className="mt-4 overflow-hidden rounded-xl border border-white/10 bg-[#171717] p-2">
                  <p className="mb-2 text-xs font-semibold text-gray-400">
                    Video Preview
                  </p>

                  <video
                    src={
                      videoPreviewUrl
                    }
                    controls
                    className="aspect-video w-full rounded-lg object-contain"
                  />

                  {form.videoFile && (
                    <p className="mt-2 truncate px-2 text-center text-xs text-gray-400">
                      {
                        form.videoFile
                          .name
                      }
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* =================================================
              RIGHT
          ================================================= */}

          <div className="flex flex-col">
            <ImageUploader
              label="Thumbnail Image"
              type="LANDSCAPE"
              value={
                defaultValues?.thumbnailUrl
              }
              onChange={(file) => {
                setForm(
                  (prev) => ({
                    ...prev,
                    thumbnailFile:
                      file,
                  }),
                );

                if (
                  errors.thumbnailFile
                ) {
                  setErrors(
                    (prev) => {
                      const next = {
                        ...prev,
                      };

                      delete next.thumbnailFile;

                      return next;
                    },
                  );
                }
              }}
            />

            {errors.thumbnailFile && (
              <p className="mt-2 text-sm text-red-500">
                {
                  errors.thumbnailFile
                }
              </p>
            )}
          </div>
        </div>

        {/* BUTTONS */}

        {errors.submit && (
          <p role="alert" className="rounded-xl border border-red-400/30 bg-red-950/40 p-3 text-sm text-red-200">
            {errors.submit}
          </p>
        )}

        <div className="flex gap-4 border-t border-white/10 pt-4">
          <button
            type="submit"
            disabled={isSubmitting || loadingEpisodes}
            className="flex-1 rounded-xl bg-[#4f6689] py-3 font-bold text-white transition hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting
              ? "Uploading..."
              : isEdit
                ? "Update Episode"
                : "Save Episode"}
          </button>

          <button
            type="button"
            onClick={() =>
              router.back()
            }
            className="rounded-xl bg-[#F41010] px-6 py-3 font-bold text-white transition hover:opacity-80"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}