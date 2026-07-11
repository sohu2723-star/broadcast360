import fs from "fs/promises";
import path from "path";

import {
  getAdvertisementById,
  updateAdvertisement,
  createAdvertisement as dbCreateAdvertisement,
  getAllAdvertisements,
  deleteAdvertisement 
} from "@/repositories/ads.repository";

import { getVideoDuration } from "../lib/media/ffmpeg";

export async function fetchAdvertisementById(id: number) {
  return getAdvertisementById(id);
}

export async function createAdvertisement(formData: FormData) {
  const title = formData.get("title") as string;
  const active = formData.get("active") === "true";
  const video = formData.get("video") as File | null;
  const thumbnail = formData.get("thumbnail") as File | null;

  if (!video || video.size === 0) {
    throw new Error("Video file is required for creating an advertisement");
  }
  const bytes = await video.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const filename = Date.now() + "-" + video.name;
  const uploadDir = path.join(process.cwd(), "public/videos/ads");
  await fs.mkdir(uploadDir, { recursive: true });
  const uploadPath = path.join(uploadDir, filename);
  await fs.writeFile(uploadPath, buffer);

  const duration = await getVideoDuration(uploadPath);

  let thumbnailUrl: string | undefined = undefined;
  if (thumbnail && thumbnail.size > 0) {
    const thumbBytes = await thumbnail.arrayBuffer();
    const thumbBuffer = Buffer.from(thumbBytes);
    const thumbFilename = Date.now() + "-" + thumbnail.name;
    const thumbUploadDir = path.join(process.cwd(), "public/thumbnails/ads");
    await fs.mkdir(thumbUploadDir, { recursive: true });
    const thumbUploadPath = path.join(thumbUploadDir, thumbFilename);
    await fs.writeFile(thumbUploadPath, thumbBuffer);
    
    thumbnailUrl = "/thumbnails/ads/" + thumbFilename;
  }

  const createData = {
    title,
    active,
    thumbnailUrl,
    videoUrl: "/videos/ads/" + filename,
    duration: duration,
  };

  return dbCreateAdvertisement(createData);
}

export async function editAdvertisement(id: number, formData: FormData) {
  const existingAd = await getAdvertisementById(id);
  if (!existingAd) {
    throw new Error("Advertisement not found");
  }
  const title = formData.get("title") as string;
  const active = formData.get("active") === "true";
  const video = formData.get("video") as File | null;
  const thumbnail = formData.get("thumbnail") as File | null;

  const updateData: {
    title: string;
    active: boolean;
    videoUrl?: string;
    thumbnailUrl?: string;
    duration?: number;
  } = {
    title,
    active,
  };

  if (video && video.size > 0) {
    if (existingAd.videoUrl) {
      const oldFilePath = path.join(process.cwd(), "public", existingAd.videoUrl);
      await fs.unlink(oldFilePath).catch(() => {
        console.warn("Old video file not found on disk, skipping deletion.");
      });
    }

    const bytes = await video.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filename = Date.now() + "-" + video.name;
    const uploadDir = path.join(process.cwd(), "public/videos/ads");
    await fs.mkdir(uploadDir, { recursive: true });
    const uploadPath = path.join(uploadDir, filename);
    await fs.writeFile(uploadPath, buffer);
    const duration = await getVideoDuration(uploadPath);
    updateData.videoUrl = "/videos/ads/" + filename;
    updateData.duration = duration;
  }

  if (thumbnail && thumbnail.size > 0) {
    if (existingAd.thumbnailUrl) {
      const oldThumbPath = path.join(process.cwd(), "public", existingAd.thumbnailUrl);
      await fs.unlink(oldThumbPath).catch(() => {
        console.warn("Old thumbnail file not found on disk, skipping deletion.");
      });
    }
    const thumbBytes = await thumbnail.arrayBuffer();
    const thumbBuffer = Buffer.from(thumbBytes);
    const thumbFilename = Date.now() + "-" + thumbnail.name;
    const thumbUploadDir = path.join(process.cwd(), "public/thumbnails/ads");
    await fs.mkdir(thumbUploadDir, { recursive: true });
    const thumbUploadPath = path.join(thumbUploadDir, thumbFilename);
    await fs.writeFile(thumbUploadPath, thumbBuffer);
    updateData.thumbnailUrl = "/thumbnails/ads/" + thumbFilename;
  }

  return updateAdvertisement(id, updateData);
}

export async function fetchAdvertisements(
  page: number,
  limit: number,
  search?: string,
  status?: string
) {
  return getAllAdvertisements(page, limit, search, status);
}
export async function removeAdvertisement(id: number) {
  const existingAd = await getAdvertisementById(id);
  if (existingAd) {
    if (existingAd.videoUrl) {
      const videoPath = path.join(process.cwd(), "public", existingAd.videoUrl);
      await fs.unlink(videoPath).catch(() => {});
    }
    if (existingAd.thumbnailUrl) {
      const thumbPath = path.join(process.cwd(), "public", existingAd.thumbnailUrl);
      await fs.unlink(thumbPath).catch(() => {});
    }
  }
  return deleteAdvertisement(id);
}