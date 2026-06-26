import fs from "fs/promises";
import path from "path";

import {
  createMovie,
  deleteMovie,
  updateMovie,
  getMovieById,
  getMovies,
} from "@/repositories/movie.repository";

import {
  getVideoDuration,
  generateThumbnail,
} from "@/lib/media/ffmpeg";

export async function fetchMovies() {
  return getMovies();
}

export async function fetchMovieById(id: number) {
  return getMovieById(id);
}

export async function removeMovie(id: number) {
  return deleteMovie(id);
}

export async function editMovie(
id:number,
data:{
title:string;
description:string;
releaseYear:number;
}
){

return updateMovie(id,data);

}

export async function addMovie(formData: FormData) {
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const video = formData.get("video") as File;

  const bytes = await video.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const filename = Date.now() + "-" + video.name;

  const uploadPath = path.join(
    process.cwd(),
    "public/videos/movies",
    filename
  );

  await fs.writeFile(uploadPath, buffer);

  const duration = await getVideoDuration(uploadPath);

  const thumbnailName = Date.now() + "-thumb.jpg";

  const thumbnailPath = path.join(
    process.cwd(),
    "public/thumbnails/movies",
    thumbnailName
  );

  await generateThumbnail(
    uploadPath,
    thumbnailPath
  );

  return createMovie({
    title,
    description,
    videoUrl: "/videos/movies/" + filename,
    thumbnail: "/thumbnails/movies/" + thumbnailName,
    duration,
  });
}