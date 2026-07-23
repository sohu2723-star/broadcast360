import fs from "fs/promises";
import path from "path";

import {
  createEpisode,
  getEpisodesBySeriesId,
  getEpisodeById as repoGetEpisodeById,
  updateEpisode as repoUpdateEpisode,
  deleteEpisode as repoDeleteEpisode,
} from "@/repositories/episode.repository";

import { getVideoDuration, generateThumbnail } from "@/lib/media/ffmpeg";

type EpisodeUpdateData = {
  title?: string;
  episodeNo?: number;
  duration?: number;

  videoFile?: File | null;
  thumbnailFile?: File | null;

  videoUrl?: string | null;
  thumbnailUrl?: string | null;
};

type EpisodeCreateInput = {
  title: string;
  episodeNo: number;
  videoFile: File | null;
  thumbnailFile: File | null;
};

// ========================
// GET EPISODE
// ========================
export function getEpisodeById(id: number) {
  return repoGetEpisodeById(id);
}

export async function updateEpisode(id: number, data: EpisodeUpdateData) {
  const current = await repoGetEpisodeById(id);

  if (!current) {
    throw new Error("Episode not found");
  }
  // const existingEpisodes = await getEpisodesBySeriesId(current.seriesId);

  // const duplicate = existingEpisodes.find(
  //   (ep) => Number(ep.episodeNo) === Number(data.episodeNo) && ep.id !== id,
  // );
  // if (duplicate) {
  //   throw new Error("Episode number already exists in this series");
  // }

  const fileId = Date.now();

  let videoUrl = current.videoUrl;
  let thumbnailUrl = current.thumbnailUrl;

  // ================= VIDEO UPLOAD =================
  if (data.videoFile instanceof File) {
    const videoName = `${fileId}-${data.videoFile.name.replace(/\s+/g, "-")}`;

    const videoPath = path.join(
      process.cwd(),
      "public/uploads/episodes/videos",
      videoName,
    );

    await fs.mkdir(path.dirname(videoPath), { recursive: true });

    await fs.writeFile(
      videoPath,
      Buffer.from(await data.videoFile.arrayBuffer()),
    );

    videoUrl = `/uploads/episodes/videos/${videoName}`;
  }

  // ================= THUMBNAIL UPLOAD =================
  if (data.thumbnailFile instanceof File) {
    const thumbName = `${fileId}-${data.thumbnailFile.name.replace(/\s+/g, "-")}`;

    const thumbPath = path.join(
      process.cwd(),
      "public/uploads/episodes/thumbnails",
      thumbName,
    );

    await fs.mkdir(path.dirname(thumbPath), { recursive: true });

    await fs.writeFile(
      thumbPath,
      Buffer.from(await data.thumbnailFile.arrayBuffer()),
    );

    thumbnailUrl = `/uploads/episodes/thumbnails/${thumbName}`;
  }

  return repoUpdateEpisode(id, {
    title: data.title ?? current.title,
    episodeNo: data.episodeNo ?? current.episodeNo,
    duration: data.duration ?? current.duration,
    videoUrl,
    thumbnailUrl,
  });
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
    const { title, episodeNo, videoFile, thumbnailFile } = data;

    if (!title || isNaN(episodeNo) || !videoFile) {
      throw new Error("Missing required fields");
    }

    // const existingEpisodes = await getEpisodesBySeriesId(seriesId);

    // const duplicate = existingEpisodes.find(
    //   (ep) => Number(ep.episodeNo) === episodeNo,
    // );

    // if (duplicate) {
    //   throw new Error("Episode number already exists in this series");
    // }

    const fileId = Date.now();

    // ================= VIDEO =================
    const videoFilename = `${fileId}-${videoFile.name.replace(/\s+/g, "-")}`;

    const videoDir = path.join(
      process.cwd(),
      "public",
      "uploads",
      "episodes",
      "videos",
    );

    await fs.mkdir(videoDir, { recursive: true });

    const videoPath = path.join(videoDir, videoFilename);

    await fs.writeFile(videoPath, Buffer.from(await videoFile.arrayBuffer()));

    // ================= DURATION =================
    let duration = 0;
    try {
      duration = await getVideoDuration(videoPath);
    } catch (err) {
      console.error("Duration error:", err);
    }

    // ================= THUMBNAIL =================
    const thumbnailDir = path.join(
      process.cwd(),
      "public",
      "uploads",
      "episodes",
      "thumbnails",
    );

    await fs.mkdir(thumbnailDir, { recursive: true });

    let thumbnailUrl: string;

    if (thumbnailFile instanceof File) {
      const thumbName = `${fileId}-${thumbnailFile.name.replace(/\s+/g, "-")}`;

      const thumbPath = path.join(thumbnailDir, thumbName);

      await fs.writeFile(
        thumbPath,
        Buffer.from(await thumbnailFile.arrayBuffer()),
      );

      thumbnailUrl = `/uploads/episodes/thumbnails/${thumbName}`;
    } else {
      const thumbName = `${fileId}-thumb.jpg`;

      const thumbPath = path.join(thumbnailDir, thumbName);

      try {
        await generateThumbnail(videoPath, thumbPath);
      } catch (err) {
        console.error("Thumbnail error:", err);
      }

      thumbnailUrl = `/uploads/episodes/thumbnails/${thumbName}`;
    }

    // ================= SAVE DB =================
    return createEpisode({
      seriesId,
      title,
      episodeNo,
      duration,
      videoUrl: `/uploads/episodes/videos/${videoFilename}`,
      thumbnailUrl,
    });
  } catch (error) {
    // console.error("addEpisode error:", error);
    throw error;
  }
}
