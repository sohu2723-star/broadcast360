import fs from "fs/promises";
import path from "path";
import { Buffer } from "buffer";
import { prisma } from "@/lib/prisma";

import {
  getVideoDuration,
} from "@/lib/media/ffmpeg";
import {
  createEntertainment,
  deleteEntertainment,
  updateEntertainment,
  getEntertainmentById,
  getPaginatedEntertainments,
} from "@/repositories/entertainment.repository";


/* =========================
   GET
========================= */
export async function fetchEntertainments({
  page,
  limit,
  search,
}: {
  page:number;
  limit:number;
  search?:string;
}) {
  return getPaginatedEntertainments({
    page,
    limit,
    search,
  });
}


/**
 * Get single entertainment by ID
 */
export function fetchEntertainmentById(
  id: number
) {
  return getEntertainmentById(id);
}


/**
 * Delete entertainment
 */
export function removeEntertainment(
  id: number
) {
  return deleteEntertainment(id);
}



/* =========================
   SAFE FILE UPLOAD
========================= */
async function saveThumbnail(file: File) {

  const bytes = await file.arrayBuffer();

  const buffer = Buffer.from(bytes);


  const filename =
    `${Date.now()}-${file.name}`;


  const uploadDir = path.join(
    process.cwd(),
    "public",
    "thumbnails",
    "entertainments"
  );


  const uploadPath =
    path.join(
      uploadDir,
      filename
    );


  await fs.mkdir(
    uploadDir,
    {
      recursive: true
    }
  );


  await fs.writeFile(
    uploadPath,
    buffer
  );


  return `/thumbnails/entertainments/${filename}`;
}

async function saveVideo(file: File) {

  const bytes = await file.arrayBuffer();

  const buffer = Buffer.from(bytes);


  const filename =
    `${Date.now()}-${file.name}`;


  const uploadDir = path.join(
    process.cwd(),
    "public",
    "videos",
    "entertainments"
  );


  const uploadPath =
    path.join(
      uploadDir,
      filename
    );


  await fs.mkdir(
    uploadDir,
    {
      recursive: true
    }
  );


  await fs.writeFile(
    uploadPath,
    buffer
  );


  return `/videos/entertainments/${filename}`;

}



/* =========================
   EDIT ENTERTAINMENT
========================= */
export async function editEntertainment(
  
  id: number,
 data: {
  title: string;
  description: string;
  category: string;
  releaseYear: number;
  duration: number;
thumbnail?: File;
video?: File;
}
) {

 
  const existingEntertainment =
    await prisma.entertainment.findFirst({
      where: {
        title: {
          equals: data.title.trim(),
          mode: "insensitive",
        },
        NOT: {
          id: id,
        },
      },
    });


  if (existingEntertainment) {
    throw new Error(
      "Entertainment title already exists"
    );
  }

 let thumbnailUrl: string | undefined;
let videoUrl: string | undefined;
let videoDuration: number | undefined;


  if (
    data.thumbnail instanceof File &&
    data.thumbnail.size > 0
  ) {

    thumbnailUrl =
      await saveThumbnail(
        data.thumbnail
      );

  }

  if (
  data.video instanceof File &&
  data.video.size > 0
) {

  const bytes =
    await data.video.arrayBuffer();

  const buffer =
    Buffer.from(bytes);


  const filename =
    `${Date.now()}-${data.video.name}`;


  const dir =
    path.join(
      process.cwd(),
      "public/videos/entertainments"
    );


  await fs.mkdir(
    dir,
    {
      recursive:true
    }
  );


  const fullPath =
    path.join(
      dir,
      filename
    );


  await fs.writeFile(
    fullPath,
    buffer
  );


  videoUrl =
    `/videos/entertainments/${filename}`;


  videoDuration =
    await getVideoDuration(
      fullPath
    );

}



const updateData = {
  title: data.title,
  description: data.description,
  category: data.category,
  releaseYear: data.releaseYear,

  ...(videoDuration !== undefined && {
    duration: videoDuration,
  }),

  ...(thumbnailUrl && {
    thumbnail: thumbnailUrl,
  }),

  ...(videoUrl && {
    videoUrl: videoUrl,
  }),
};

return updateEntertainment(
  id,
  updateData
);

}



/* =========================
   ADD ENTERTAINMENT
========================= */
export async function addEntertainment(
  formData: FormData
) {


  const title =
    String(
      formData.get("title") || ""
    );


  const description =
    String(
      formData.get("description") || ""
    );


  const category =
    String(
      formData.get("category") || ""
    );
    
  const releaseYearValue =
    formData.get("releaseYear");
  const releaseYear =
    releaseYearValue
      ? Number(releaseYearValue)
      : undefined;


  const durationValue =
    formData.get("duration");

  const duration =
    durationValue
      ? Number(durationValue)
      : undefined;



  const thumbnail =
    formData.get("thumbnail") as File | null;

  const video =
    formData.get("video") as File | null;



 if (
  !title ||
  !description ||
  !category
) {

  throw new Error(
    "Missing required fields"
  );

}

  // CHECK DUPLICATE TITLE
  const existingEntertainment =
    await prisma.entertainment.findFirst({
      where: {
        title: {
          equals: title.trim(),
          mode: "insensitive",
        },
      },
    });


  if (existingEntertainment) {
    throw new Error(
      "Entertainment title already exists"
    );
  }



 let thumbnailUrl = "";
let videoUrl = "";
let videoDuration: number | undefined;



  if (
    thumbnail instanceof File &&
    thumbnail.size > 0
  ) {

    thumbnailUrl =
      await saveThumbnail(
        thumbnail
      );

  }

 if (
  video instanceof File &&
  video.size > 0
) {

  const bytes =
    await video.arrayBuffer();

  const buffer =
    Buffer.from(bytes);


  const filename =
    `${Date.now()}-${video.name}`;


  const dir =
    path.join(
      process.cwd(),
      "public/videos/entertainments"
    );


  await fs.mkdir(
    dir,
    {
      recursive:true
    }
  );


  const fullPath =
    path.join(
      dir,
      filename
    );


  await fs.writeFile(
    fullPath,
    buffer
  );


  videoUrl =
    `/videos/entertainments/${filename}`;


  videoDuration =
    await getVideoDuration(
      fullPath
    );

}


 return createEntertainment({

  title,

  description,

  category,

  releaseYear:
    releaseYear ?? new Date().getFullYear(),

  duration:
    videoDuration ?? 0,

  thumbnail:
    thumbnailUrl,

  videoUrl:
    videoUrl,

});
}