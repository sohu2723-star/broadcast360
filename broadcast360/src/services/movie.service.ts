import fs from "fs/promises";
import path from "path";

import {
  createMovie,
  updateMovie,
  deleteMovie,
  getMovieById,
  getPaginatedMovies,
} from "@/repositories/movie.repository";

import {
  getVideoDuration,
} from "@/lib/media/ffmpeg";

/* -------------------------
   PAGINATION
--------------------------*/
export async function fetchPaginatedMovies(
  page: number,
  limit: number,
  search?: string
) {
  const { data, total } = await getPaginatedMovies({
    page,
    limit,
    search,
  });

  return {
    data,
    pagination: {
      page,
      limit,
      total,
    },
  };
}

/* -------------------------
   GET BY ID
--------------------------*/
export function fetchMovieById(id: number) {
  return getMovieById(id);
}

/* -------------------------
   DELETE
--------------------------*/
export function removeMovie(id: number) {
  return deleteMovie(id);
}

/* -------------------------
   UPDATE MOVIE (WITH OPTIONAL THUMBNAIL)
--------------------------*/
export async function editMovie(
  formData: FormData,
  id: number
) {
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const genre = formData.get("genre") as string;
  const releaseYear = Number(formData.get("releaseYear"));

  const thumbnail = formData.get("thumbnail") as File | null;
  const video = formData.get("video") as File | null;

  const updateData: {
    title: string;
    description: string;
    genre: string;
    releaseYear: number;
    thumbnail?: string;
    videoUrl?: string;
    duration?: number;
  } = {
    title,
    description,
    genre,
    releaseYear,
  };

  // Replace Thumbnail
  if (thumbnail && thumbnail.size > 0) {
    const bytes = await thumbnail.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const filename = `${Date.now()}-${thumbnail.name}`;

    const dir = path.join(
      process.cwd(),
      "public/thumbnails/movies"
    );

    await fs.mkdir(dir, { recursive: true });

    const fullPath = path.join(dir, filename);

    await fs.writeFile(fullPath, buffer);

    updateData.thumbnail = `/thumbnails/movies/${filename}`;
  }

  // Replace Video
  if (video && video.size > 0) {
    const bytes = await video.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const filename = `${Date.now()}-${video.name}`;

    const dir = path.join(
      process.cwd(),
      "public/videos/movies"
    );

    await fs.mkdir(dir, { recursive: true });

    const fullPath = path.join(dir, filename);

    await fs.writeFile(fullPath, buffer);

    const duration = await getVideoDuration(fullPath);

    updateData.videoUrl = `/videos/movies/${filename}`;
    updateData.duration = duration;
  }

  return updateMovie(id, updateData);
}
/* -------------------------
   CREATE MOVIE (UPLOAD VIDEO + THUMBNAIL AUTO)
--------------------------*/
export async function addMovie(formData: FormData) {
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const genre = formData.get("genre") as string;
  const releaseYear = Number(formData.get("releaseYear"));

  const video = formData.get("video") as File;
  const thumbnail = formData.get("thumbnail") as File;

  if (!video) {
    throw new Error("Video is required");
  }

  if (!thumbnail) {
    throw new Error("Thumbnail is required");
  }

  // Save Video
  const videoBytes = await video.arrayBuffer();
  const videoBuffer = Buffer.from(videoBytes);

  const videoFilename = `${Date.now()}-${video.name}`;

  const videoDir = path.join(
    process.cwd(),
    "public/videos/movies"
  );

  await fs.mkdir(videoDir, { recursive: true });

  const videoPath = path.join(videoDir, videoFilename);

  await fs.writeFile(videoPath, videoBuffer);

  // Get Duration Only
  const duration = await getVideoDuration(videoPath);

  // Save Thumbnail
  const thumbnailBytes = await thumbnail.arrayBuffer();
  const thumbnailBuffer = Buffer.from(thumbnailBytes);

  const thumbnailFilename = `${Date.now()}-${thumbnail.name}`;

  const thumbnailDir = path.join(
    process.cwd(),
    "public/thumbnails/movies"
  );

  await fs.mkdir(thumbnailDir, { recursive: true });

  const thumbnailPath = path.join(
    thumbnailDir,
    thumbnailFilename
  );

  await fs.writeFile(thumbnailPath, thumbnailBuffer);

  return createMovie({
    title,
    description,
    genre,
    releaseYear,
    videoUrl: `/videos/movies/${videoFilename}`,
    thumbnail: `/thumbnails/movies/${thumbnailFilename}`,
    duration,
  });
}