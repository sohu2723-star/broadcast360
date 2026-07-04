import fs from "fs/promises";
import path from "path";

import {
  createEpisode,
  getEpisodesBySeriesId,
  getEpisodeById as repoGetEpisodeById,
  updateEpisode as repoUpdateEpisode,
  deleteEpisode as repoDeleteEpisode,
} from "@/repositories/episode.repository";

import {
  getVideoDuration,
  generateThumbnail,
} from "@/lib/media/ffmpeg";

// ========================
// TYPES
// ========================
type EpisodeUpdateData = {
  title?: string;
  episodeNo?: number;
  duration?: number;
  videoUrl?: string | null;
  thumbnailUrl?: string | null;
};

type EpisodeCreateInput = {
  title: string;
  episodeNo: number;
  formData: FormData;
};

// ========================
// GET EPISODE
// ========================
export function getEpisodeById(id: number) {
  return repoGetEpisodeById(id);
}

// ========================
// UPDATE EPISODE
// ========================
export async function updateEpisode(id: number, data: EpisodeUpdateData) {
  const current = await repoGetEpisodeById(id);

  if (!current) {
    throw new Error("Episode not found");
  }

  const allEpisodes = await getEpisodesBySeriesId(current.seriesId);

  const newEpisodeNo = Number(data.episodeNo);

  const duplicate = allEpisodes.find(
    (ep) =>
      Number(ep.episodeNo) === newEpisodeNo &&
      ep.id !== id
  );

  if (duplicate) {
    throw new Error("Episode number already exists in this series");
  }

  return repoUpdateEpisode(id, data);
}

// ========================
// DELETE EPISODE
// ========================
export function deleteEpisode(id: number) {
  return repoDeleteEpisode(id);
}

// ========================
// FETCH EPISODES BY SERIES
// ========================
export async function fetchEpisodesBySeriesId(seriesId: number) {
  return getEpisodesBySeriesId(seriesId);
}

// ========================
// ADD EPISODE (UPLOAD + FFmpeg)
// ========================
export async function addEpisode(seriesId: number, data: EpisodeCreateInput) {
  try {
    const title = data.title?.trim();
    const episodeNo = Number(data.episodeNo);
    const formData = data.formData;

    const video = formData.get("video") as File | null;

    if (!title || isNaN(episodeNo) || isNaN(seriesId) || !video) {
      throw new Error("Missing required fields");
    }

    const existingEpisodes = await getEpisodesBySeriesId(seriesId);

    const duplicate = existingEpisodes.find(
      (ep) => Number(ep.episodeNo) === episodeNo
    );

    if (duplicate) {
      throw new Error("Episode number already exists in this series");
    }

    // ========================
    // 📍 UPLOAD PATH
    // ========================
    const fileId = Date.now();

    const filename = `${fileId}-${video.name.replace(/\s+/g, "-")}`;

    const uploadDir = path.join(
      process.cwd(),
      "public",
      "uploads",
      "episodes",
      "videos"
    );

    const uploadPath = path.join(uploadDir, filename);

    await fs.mkdir(uploadDir, { recursive: true });

    const bytes = await video.arrayBuffer();
    const buffer = Buffer.from(bytes);

    await fs.writeFile(uploadPath, buffer);

    // ========================
    // 📍 FFmpeg PROCESSING
    // ========================
    let duration = 0;

    try {
      duration = await getVideoDuration(uploadPath);
    } catch (err) {
      console.error("Duration error:", err);
    }

    // ========================
    // 📍 THUMBNAIL PATH
    // ========================
    const thumbnailDir = path.join(
      process.cwd(),
      "public",
      "uploads",
      "episodes",
      "thumbnails"
    );

    const thumbnailName = `${fileId}-thumb.jpg`;
    const thumbnailPath = path.join(thumbnailDir, thumbnailName);

    await fs.mkdir(thumbnailDir, { recursive: true });

    try {
      await generateThumbnail(uploadPath, thumbnailPath);
    } catch (err) {
      console.error("Thumbnail error:", err);
    }

    // ========================
    // SAVE DB
    // ========================
    return createEpisode({
      seriesId,
      title,
      episodeNo,
      duration,
      videoUrl: `/uploads/episodes/videos/${filename}`,
      thumbnailUrl: `/uploads/episodes/thumbnails/${thumbnailName}`,
    });
  } catch (error) {
    console.error("addEpisode error:", error);
    throw error;
  }
}