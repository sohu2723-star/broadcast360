import {
  removeTemporaryMediaFile,
  uploadMediaFile,
  writeTemporaryMediaFile,
} from "@/lib/media/storage";

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
  const accessType = formData.get("accessType") === "PREMIUM" ? "PREMIUM" : "FREE";

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
    accessType: "FREE" | "PREMIUM";
  } = {
    title,
    description,
    genre,
    releaseYear,
    accessType,
  };

  // Replace Thumbnail
  if (thumbnail && thumbnail.size > 0) {
    updateData.thumbnail = await uploadMediaFile(
      thumbnail,
      "thumbnails/movies",
    );
  }

  // Replace Video
  if (video && video.size > 0) {
    const temporaryPath = await writeTemporaryMediaFile(video, "hxumovie-movie");

    try {
      updateData.videoUrl = await uploadMediaFile(video, "videos/movies");
      updateData.duration = await getVideoDuration(temporaryPath);
    } finally {
      await removeTemporaryMediaFile(temporaryPath);
    }
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
  const accessType = formData.get("accessType") === "PREMIUM" ? "PREMIUM" : "FREE";

  const video = formData.get("video") as File | null;
  const thumbnail = formData.get("thumbnail") as File | null;
  const preUploadedVideoUrl = String(formData.get("videoUrl") ?? "").trim();
  const preUploadedThumbnailUrl = String(formData.get("thumbnailUrl") ?? "").trim();
  const preUploadedDuration = Number(formData.get("duration"));

  if ((!video || video.size <= 0) && !preUploadedVideoUrl) {
    throw new Error("Video is required");
  }

  if ((!thumbnail || thumbnail.size <= 0) && !preUploadedThumbnailUrl) {
    throw new Error("Thumbnail is required");
  }

  if (preUploadedVideoUrl && preUploadedThumbnailUrl) {
    return createMovie({
      title,
      description,
      genre,
      releaseYear,
      videoUrl: preUploadedVideoUrl,
      thumbnail: preUploadedThumbnailUrl,
      duration:
        Number.isFinite(preUploadedDuration) && preUploadedDuration >= 0
          ? Math.round(preUploadedDuration)
          : 0,
      accessType,
    });
  }

  if (!video || !thumbnail) {
    throw new Error("Both video and thumbnail are required");
  }

  const temporaryPath = await writeTemporaryMediaFile(video, "hxumovie-movie");

  try {
    const [videoUrl, thumbnailUrl, duration] = await Promise.all([
      uploadMediaFile(video, "videos/movies"),
      uploadMediaFile(thumbnail, "thumbnails/movies"),
      getVideoDuration(temporaryPath),
    ]);

    return createMovie({
      title,
      description,
      genre,
      releaseYear,
      videoUrl,
      thumbnail: thumbnailUrl,
      duration,
      accessType,
    });
  } finally {
    await removeTemporaryMediaFile(temporaryPath);
  }
}
