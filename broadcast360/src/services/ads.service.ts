import {
  getAdvertisementById,
  updateAdvertisement,
  createAdvertisement as dbCreateAdvertisement,
  getAllAdvertisements,
  deleteAdvertisement,
} from "@/repositories/ads.repository";
import {
  removeTemporaryMediaFile,
  uploadMediaFile,
  writeTemporaryMediaFile,
} from "@/lib/media/storage";
import { getVideoDuration } from "@/lib/media/ffmpeg";

export async function fetchAdvertisementById(id: number) {
  return getAdvertisementById(id);
}

export async function createAdvertisement(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const active = formData.get("active") === "true";
  const video = formData.get("video") as File | null;
  const thumbnail = formData.get("thumbnail") as File | null;

  if (!video || video.size === 0) {
    throw new Error("Video file is required for creating an advertisement");
  }

  const temporaryPath = await writeTemporaryMediaFile(video, "broadcast360-ad");
  try {
    const [videoUrl, thumbnailUrl, duration] = await Promise.all([
      uploadMediaFile(video, "videos/ads"),
      thumbnail && thumbnail.size > 0
        ? uploadMediaFile(thumbnail, "thumbnails/ads")
        : Promise.resolve(undefined),
      getVideoDuration(temporaryPath),
    ]);

    return dbCreateAdvertisement({
      title,
      active,
      thumbnailUrl,
      videoUrl,
      duration,
    });
  } finally {
    await removeTemporaryMediaFile(temporaryPath);
  }
}

export async function editAdvertisement(id: number, formData: FormData) {
  const existingAd = await getAdvertisementById(id);
  if (!existingAd) {
    throw new Error("Advertisement not found");
  }

  const title = String(formData.get("title") ?? "").trim();
  const active = formData.get("active") === "true";
  const video = formData.get("video") as File | null;
  const thumbnail = formData.get("thumbnail") as File | null;
  const updateData: {
    title: string;
    active: boolean;
    videoUrl?: string;
    thumbnailUrl?: string;
    duration?: number;
  } = { title, active };

  if (video && video.size > 0) {
    const temporaryPath = await writeTemporaryMediaFile(video, "broadcast360-ad");
    try {
      updateData.videoUrl = await uploadMediaFile(video, "videos/ads");
      updateData.duration = await getVideoDuration(temporaryPath);
    } finally {
      await removeTemporaryMediaFile(temporaryPath);
    }
  }

  if (thumbnail && thumbnail.size > 0) {
    updateData.thumbnailUrl = await uploadMediaFile(thumbnail, "thumbnails/ads");
  }

  return updateAdvertisement(id, updateData);
}

export async function fetchAdvertisements(
  page: number,
  limit: number,
  search?: string,
  status?: string,
) {
  return getAllAdvertisements(page, limit, search, status);
}

export async function removeAdvertisement(id: number) {
  return deleteAdvertisement(id);
}
