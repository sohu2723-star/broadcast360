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
    updateData.thumbnail = await uploadMediaFile(
      thumbnail,
      "thumbnails/movies",
    );
  }

  // Replace Video
  if (video && video.size > 0) {
    const temporaryPath = await writeTemporaryMediaFile(video, "broadcast360-movie");

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

  const video = formData.get("video") as File;
  const thumbnail = formData.get("thumbnail") as File;

  if (!video) {
    throw new Error("Video is required");
  }

  if (!thumbnail) {
    throw new Error("Thumbnail is required");
  }

  const temporaryPath = await writeTemporaryMediaFile(video, "broadcast360-movie");

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
    });
  } finally {
    await removeTemporaryMediaFile(temporaryPath);
  }
}
