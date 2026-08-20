import { prisma } from "@/lib/prisma";
import {
  removeTemporaryMediaFile,
  uploadMediaFile,
  writeTemporaryMediaFile,
} from "@/lib/media/storage";
import { getVideoDuration } from "@/lib/media/ffmpeg";
import {
  createEntertainment,
  deleteEntertainment,
  updateEntertainment,
  getEntertainmentById,
  getPaginatedEntertainments,
} from "@/repositories/entertainment.repository";

export async function fetchEntertainments({
  page,
  limit,
  search,
}: {
  page: number;
  limit: number;
  search?: string;
}) {
  return getPaginatedEntertainments({ page, limit, search });
}

export function fetchEntertainmentById(id: number) {
  return getEntertainmentById(id);
}

export function removeEntertainment(id: number) {
  return deleteEntertainment(id);
}

export async function editEntertainment(
  id: number,
  data: {
    title: string;
    description: string;
    category: string;
    releaseYear: number;
    duration: number;
    thumbnail?: File;
    video?: File;
  },
) {
  const existingEntertainment = await prisma.entertainment.findFirst({
    where: {
      title: { equals: data.title.trim(), mode: "insensitive" },
      NOT: { id },
    },
  });

  if (existingEntertainment) {
    throw new Error("Entertainment title already exists");
  }

  const updateData: {
    title: string;
    description: string;
    category: string;
    releaseYear: number;
    duration: number;
    thumbnail?: string;
    videoUrl?: string;
  } = {
    title: data.title,
    description: data.description,
    category: data.category,
    releaseYear: data.releaseYear,
    duration: Number.isNaN(data.duration) ? 0 : data.duration,
  };

  if (data.thumbnail instanceof File && data.thumbnail.size > 0) {
    updateData.thumbnail = await uploadMediaFile(
      data.thumbnail,
      "thumbnails/entertainments",
    );
  }

  if (data.video instanceof File && data.video.size > 0) {
    const temporaryPath = await writeTemporaryMediaFile(
      data.video,
      "hxumovie-entertainment",
    );
    try {
      updateData.videoUrl = await uploadMediaFile(
        data.video,
        "videos/entertainments",
      );
      updateData.duration = await getVideoDuration(temporaryPath);
    } finally {
      await removeTemporaryMediaFile(temporaryPath);
    }
  }

  return updateEntertainment(id, updateData);
}

export async function addEntertainment(formData: FormData) {
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const category = String(formData.get("category") || "").trim();
  const releaseYearValue = formData.get("releaseYear");
  const releaseYear = releaseYearValue ? Number(releaseYearValue) : undefined;
  const thumbnail = formData.get("thumbnail") as File | null;
  const video = formData.get("video") as File | null;
  const preUploadedThumbnailUrl = String(formData.get("thumbnailUrl") ?? "").trim();
  const preUploadedVideoUrl = String(formData.get("videoUrl") ?? "").trim();
  const preUploadedDuration = Number(formData.get("duration"));

  if (!title || !description || !category) {
    throw new Error("Missing required fields");
  }

  const existingEntertainment = await prisma.entertainment.findFirst({
    where: { title: { equals: title, mode: "insensitive" } },
  });

  if (existingEntertainment) {
    throw new Error("Entertainment title already exists");
  }

  const thumbnailUrl =
    preUploadedThumbnailUrl ||
    (thumbnail instanceof File && thumbnail.size > 0
      ? await uploadMediaFile(thumbnail, "thumbnails/entertainments")
      : "");

  let videoUrl = preUploadedVideoUrl;
  let duration =
    Number.isFinite(preUploadedDuration) && preUploadedDuration >= 0
      ? Math.round(preUploadedDuration)
      : 0;

  if (!videoUrl && video instanceof File && video.size > 0) {
    const temporaryPath = await writeTemporaryMediaFile(
      video,
      "hxumovie-entertainment",
    );
    try {
      videoUrl = await uploadMediaFile(video, "videos/entertainments");
      duration = await getVideoDuration(temporaryPath);
    } finally {
      await removeTemporaryMediaFile(temporaryPath);
    }
  }

  return createEntertainment({
    title,
    description,
    category,
    releaseYear: releaseYear ?? new Date().getFullYear(),
    duration,
    thumbnail: thumbnailUrl,
    videoUrl,
  });
}
