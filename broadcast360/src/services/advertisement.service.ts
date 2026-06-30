import fs from "fs/promises";
import path from "path";

import {
  getAdvertisementById,
  updateAdvertisement,
  createAdvertisement as dbCreateAdvertisement,
} from "@/repositories/advertisement.repository";

import { getVideoDuration } from "../lib/media/ffmpeg";

export async function fetchAdvertisementById(id: number) {
  return getAdvertisementById(id);
}

export async function createAdvertisement(formData: FormData) {
  const title = formData.get("title") as string;
  const active = formData.get("active") === "true";
  const video = formData.get("video") as File | null;
  if (!video || video.size === 0) {
    throw new Error("Video file is required for creating an advertisement");
  }
  const bytes = await video.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const filename = Date.now() + "-" + video.name;
  const uploadDir = path.join(process.cwd(), "public/videos/advertisements");
  await fs.mkdir(uploadDir, { recursive: true });
  const uploadPath = path.join(uploadDir, filename);
  await fs.writeFile(uploadPath, buffer);


  const duration = await getVideoDuration(uploadPath);

  const createData = {
    title,
    active,
    videoUrl: "/videos/advertisements/" + filename,
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

  const updateData: {
    title: string;
    active: boolean;
    videoUrl?: string;
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
    const uploadDir = path.join(process.cwd(), "public/videos/advertisements");

    await fs.mkdir(uploadDir, { recursive: true });

    const uploadPath = path.join(uploadDir, filename);
    await fs.writeFile(uploadPath, buffer);

    const duration = await getVideoDuration(uploadPath);

    updateData.videoUrl = "/videos/advertisements/" + filename;
    updateData.duration = duration;
  }

  return updateAdvertisement(id, updateData);
}