import fs from "fs/promises";
import path from "path";
import { Buffer } from "buffer";

import {
  createSeries,
  deleteSeries,
  updateSeries,
  getSeriesById,
  getPaginatedSeries,
  getSeries,
} from "@/repositories/serie.repository";

/* =========================
   GET
========================= */
export async function fetchSeries() {
  return getSeries();
}

/**
 * Get paginated series list
 */
export async function fetchPaginatedSeries(
  page: number,
  limit: number,
  search?: string
) {
  const validatedPage = Math.max(1, page);
  const validatedLimit = Math.max(1, limit);

  const { data, total } = await getPaginatedSeries({
    page: validatedPage,
    limit: validatedLimit,
    search,
  });

  return {
    data,
    pagination: {
      page: validatedPage,
      limit: validatedLimit,
      total,
    },
  };
}


/**
 * Get single series by ID
 */
export function fetchSeriesById(
  id: number,
  opts?: { skip: number; take: number }
) {
  return getSeriesById(id, opts);
}


/**
 * Delete series
 */
export function removeSeries(id: number) {
  return deleteSeries(id);
}

/* =========================
   SAFE FILE UPLOAD (FIXED PATH)
========================= */
async function saveThumbnail(file: File) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const filename = `${Date.now()}-${file.name}`;

  // ✅ FIXED ROOT PATH
  const uploadDir = path.join(
    process.cwd(),
    "public",
    "thumbnails",
    "series"
  );

  const uploadPath = path.join(uploadDir, filename);

  // ✅ ALWAYS CREATE FOLDER
  await fs.mkdir(uploadDir, { recursive: true });

  await fs.writeFile(uploadPath, buffer);

  return `/thumbnails/series/${filename}`;
}

/* =========================
   EDIT SERIES
========================= */
export async function editSeries(
  id: number,
  data: {
    title: string;
    description: string;
    genre: string;
    releaseYear: number;
    thumbnail?: File | null;
  }
) {
  let thumbnailUrl: string | undefined;

  if (data.thumbnail instanceof File && data.thumbnail.size > 0) {
    thumbnailUrl = await saveThumbnail(data.thumbnail);
  }

  return updateSeries(id, {
    title: data.title,
    description: data.description,
    genre: data.genre,
    releaseYear: data.releaseYear,
    ...(thumbnailUrl && { thumbnail: thumbnailUrl }),
  });
}

/* =========================
   ADD SERIES
========================= */
export async function addSeries(formData: FormData) {
  const title = String(formData.get("title") || "");
  const description = String(formData.get("description") || "");
  const genre = String(formData.get("genre") || "");
  const releaseYear = Number(formData.get("releaseYear"));
  const thumbnail = formData.get("thumbnail") as File | null;

  // ❗ SAFETY CHECK (prevents Prisma crash)
  if (!title || !description || !genre || isNaN(releaseYear)) {
    throw new Error("Missing required fields");
  }

  let thumbnailUrl = "";

  if (thumbnail instanceof File && thumbnail.size > 0) {
    thumbnailUrl = await saveThumbnail(thumbnail);
  }

  return createSeries({
    title,
    description,
    genre,
    releaseYear,
    thumbnail: thumbnailUrl,
  });
}