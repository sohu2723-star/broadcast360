import fs from "fs/promises";
import path from "path";

import {
  createEpisode,
  getEpisodesBySeriesId,
  getEpisodeById as repoGetEpisodeById,
  updateEpisode as repoUpdateEpisode,
  deleteEpisode as repoDeleteEpisode,
  getSeriesById,
  getEpisodesBySeriesAndEpisodeNo,
  findEpisodeByTitle,
} from "@/repositories/episode.repository";

import {
  getVideoDuration,
  generateThumbnail,
} from "@/lib/media/ffmpeg";

// =====================================================
// TYPES
// =====================================================

export type EpisodeUpdateData = {
  title?: string;
  episodeNo?: number;
  videoFile?: File | null;
  thumbnailFile?: File | null;
};

export type EpisodeCreateInput = {
  title?: string;
  episodeNo: number;
  videoFile: File | null;
  thumbnailFile: File | null;
};

// =====================================================
// PART NUMBER
// =====================================================

function getPartFromTitle(
  title: string,
): number {
  const match = title.match(
    /-\s*Part\s+(\d+)\s*$/i,
  );

  if (!match) {
    return 0;
  }

  const part = Number(match[1]);

  if (
    !Number.isInteger(part) ||
    part < 1
  ) {
    return 0;
  }

  return part;
}

// =====================================================
// NEXT PART NUMBER
// =====================================================

async function getNextPartNumber(
  seriesId: number,
  episodeNo: number,
  excludeId?: number,
): Promise<number> {
  const episodes =
    await getEpisodesBySeriesAndEpisodeNo(
      seriesId,
      episodeNo,
    );

  const usedParts = new Set<number>();

  for (const episode of episodes) {
    if (
      excludeId !== undefined &&
      Number(episode.id) === Number(excludeId)
    ) {
      continue;
    }

    const part = getPartFromTitle(
      episode.title,
    );

    if (part > 0) {
      usedParts.add(part);
    }
  }

  let nextPart = 1;

  while (usedParts.has(nextPart)) {
    nextPart++;
  }

  return nextPart;
}

// =====================================================
// GET EPISODE
// =====================================================

export function getEpisodeById(
  id: number,
) {
  return repoGetEpisodeById(id);
}

// =====================================================
// GET ALL EPISODES
// =====================================================

export async function fetchEpisodesBySeriesId(
  seriesId: number,
) {
  const episodes =
    await getEpisodesBySeriesId(
      seriesId,
    );

  return episodes.sort(
    (a, b) => {
      // 1. Episode number
      if (
        a.episodeNo !==
        b.episodeNo
      ) {
        return (
          a.episodeNo -
          b.episodeNo
        );
      }

      // 2. Part number
      const partA =
        getPartFromTitle(
          a.title,
        );

      const partB =
        getPartFromTitle(
          b.title,
        );

      if (partA !== partB) {
        return partA - partB;
      }

      // 3. Created date
      const dateA =
        new Date(
          a.createdAt,
        ).getTime();

      const dateB =
        new Date(
          b.createdAt,
        ).getTime();

      if (dateA !== dateB) {
        return dateA - dateB;
      }

      // 4. ID
      return a.id - b.id;
    },
  );
}

// =====================================================
// CREATE EPISODE
// =====================================================

export async function addEpisode(
  seriesId: number,
  data: EpisodeCreateInput,
) {
  const {
    title,
    episodeNo,
    videoFile,
    thumbnailFile,
  } = data;

  // ===================================================
  // VALIDATE EPISODE NUMBER
  // ===================================================

  if (
    !Number.isInteger(episodeNo) ||
    episodeNo < 1
  ) {
    throw new Error(
      "Invalid episode number",
    );
  }

  // ===================================================
  // VIDEO REQUIRED
  // ===================================================

  if (!videoFile) {
    throw new Error(
      "Video file is required",
    );
  }

  // ===================================================
  // SERIES
  // ===================================================

  const series =
    await getSeriesById(
      seriesId,
    );

  if (!series) {
    throw new Error(
      "Series not found",
    );
  }

  // ===================================================
  // TITLE
  // ===================================================

  const cleanTitle =
    title?.trim() ?? "";

  let finalTitle =
    cleanTitle;

  if (!finalTitle) {
    const partNumber =
      await getNextPartNumber(
        seriesId,
        episodeNo,
      );

    finalTitle =
      `${series.title} - Part ${partNumber}`;
  }

  // ===================================================
  // DUPLICATE TITLE
  // ===================================================

  const duplicate =
    await findEpisodeByTitle(
      seriesId,
      episodeNo,
      finalTitle,
    );

  if (duplicate) {
    throw new Error(
      "Episode title already exists",
    );
  }

  // ===================================================
  // FILE ID
  // ===================================================

  const fileId =
    Date.now();

  // ===================================================
  // VIDEO
  // ===================================================

  const safeVideoName =
    videoFile.name
      .replace(/\s+/g, "-")
      .replace(
        /[^a-zA-Z0-9._-]/g,
        "",
      );

  const videoFilename =
    `${fileId}-${safeVideoName}`;

  const videoDir =
    path.join(
      process.cwd(),
      "public",
      "uploads",
      "episodes",
      "videos",
    );

  await fs.mkdir(
    videoDir,
    {
      recursive: true,
    },
  );

  const videoPath =
    path.join(
      videoDir,
      videoFilename,
    );

  await fs.writeFile(
    videoPath,
    Buffer.from(
      await videoFile.arrayBuffer(),
    ),
  );

  // ===================================================
  // DURATION
  // ===================================================

  let duration = 0;

  try {
    duration =
      await getVideoDuration(
        videoPath,
      );
  } catch (error) {
    console.error(
      "Duration error:",
      error,
    );
  }

  // ===================================================
  // THUMBNAIL DIRECTORY
  // ===================================================

  const thumbnailDir =
    path.join(
      process.cwd(),
      "public",
      "uploads",
      "episodes",
      "thumbnails",
    );

  await fs.mkdir(
    thumbnailDir,
    {
      recursive: true,
    },
  );

  // ===================================================
  // THUMBNAIL
  // ===================================================

  let thumbnailUrl = "";

  if (
    thumbnailFile instanceof File &&
    thumbnailFile.size > 0
  ) {
    const safeThumbName =
      thumbnailFile.name
        .replace(/\s+/g, "-")
        .replace(
          /[^a-zA-Z0-9._-]/g,
          "",
        );

    const thumbName =
      `${fileId}-${safeThumbName}`;

    const thumbPath =
      path.join(
        thumbnailDir,
        thumbName,
      );

    await fs.writeFile(
      thumbPath,
      Buffer.from(
        await thumbnailFile.arrayBuffer(),
      ),
    );

    thumbnailUrl =
      `/uploads/episodes/thumbnails/${thumbName}`;
  } else {
    const thumbName =
      `${fileId}-thumb.jpg`;

    const thumbPath =
      path.join(
        thumbnailDir,
        thumbName,
      );

    try {
      await generateThumbnail(
        videoPath,
        thumbPath,
      );

      thumbnailUrl =
        `/uploads/episodes/thumbnails/${thumbName}`;
    } catch (error) {
      console.error(
        "Thumbnail error:",
        error,
      );

      thumbnailUrl = "";
    }
  }

  // ===================================================
  // DATABASE
  // ===================================================

  return createEpisode({
    seriesId,
    title: finalTitle,
    episodeNo,
    duration,
    videoUrl:
      `/uploads/episodes/videos/${videoFilename}`,
    thumbnailUrl,
  });
}

// =====================================================
// UPDATE EPISODE
// =====================================================

export async function updateEpisode(
  id: number,
  data: EpisodeUpdateData,
) {
  const current =
    await repoGetEpisodeById(
      id,
    );

  if (!current) {
    throw new Error(
      "Episode not found",
    );
  }

  // ===================================================
  // EPISODE NUMBER
  // ===================================================

  const episodeNo =
    data.episodeNo ??
    current.episodeNo;

  if (
    !Number.isInteger(episodeNo) ||
    episodeNo < 1
  ) {
    throw new Error(
      "Invalid episode number",
    );
  }

  // ===================================================
  // SERIES
  // ===================================================

  const series =
    await getSeriesById(
      current.seriesId,
    );

  if (!series) {
    throw new Error(
      "Series not found",
    );
  }

  // ===================================================
  // TITLE
  // ===================================================

  const cleanTitle =
    data.title?.trim() ?? "";

  let finalTitle =
    cleanTitle;

  if (!finalTitle) {
    let partNumber: number;

    if (
      episodeNo ===
      current.episodeNo
    ) {
      const currentPart =
        getPartFromTitle(
          current.title,
        );

      if (currentPart > 0) {
        partNumber =
          currentPart;
      } else {
        partNumber =
          await getNextPartNumber(
            current.seriesId,
            episodeNo,
            id,
          );
      }
    } else {
      partNumber =
        await getNextPartNumber(
          current.seriesId,
          episodeNo,
          id,
        );
    }

    finalTitle =
      `${series.title} - Part ${partNumber}`;
  }

  // ===================================================
  // DUPLICATE TITLE
  // ===================================================

  const duplicate =
    await findEpisodeByTitle(
      current.seriesId,
      episodeNo,
      finalTitle,
      id,
    );

  if (duplicate) {
    throw new Error(
      "Episode title already exists",
    );
  }

  // ===================================================
  // FILE ID
  // ===================================================

  const fileId =
    Date.now();

  let videoUrl =
    current.videoUrl;

  let thumbnailUrl =
    current.thumbnailUrl;

  let duration =
    current.duration;

  // ===================================================
  // VIDEO
  // ===================================================

  if (
    data.videoFile instanceof File &&
    data.videoFile.size > 0
  ) {
    const safeVideoName =
      data.videoFile.name
        .replace(/\s+/g, "-")
        .replace(
          /[^a-zA-Z0-9._-]/g,
          "",
        );

    const videoName =
      `${fileId}-${safeVideoName}`;

    const videoDir =
      path.join(
        process.cwd(),
        "public",
        "uploads",
        "episodes",
        "videos",
      );

    await fs.mkdir(
      videoDir,
      {
        recursive: true,
      },
    );

    const videoPath =
      path.join(
        videoDir,
        videoName,
      );

    await fs.writeFile(
      videoPath,
      Buffer.from(
        await data.videoFile.arrayBuffer(),
      ),
    );

    videoUrl =
      `/uploads/episodes/videos/${videoName}`;

    try {
      duration =
        await getVideoDuration(
          videoPath,
        );
    } catch (error) {
      console.error(
        "Duration update error:",
        error,
      );
    }

    if (
      !(
        data.thumbnailFile instanceof File &&
        data.thumbnailFile.size > 0
      )
    ) {
      const thumbnailDir =
        path.join(
          process.cwd(),
          "public",
          "uploads",
          "episodes",
          "thumbnails",
        );

      await fs.mkdir(
        thumbnailDir,
        {
          recursive: true,
        },
      );

      const thumbName =
        `${fileId}-thumb.jpg`;

      const thumbPath =
        path.join(
          thumbnailDir,
          thumbName,
        );

      try {
        await generateThumbnail(
          videoPath,
          thumbPath,
        );

        thumbnailUrl =
          `/uploads/episodes/thumbnails/${thumbName}`;
      } catch (error) {
        console.error(
          "Thumbnail update error:",
          error,
        );
      }
    }
  }

  // ===================================================
  // THUMBNAIL
  // ===================================================

  if (
    data.thumbnailFile instanceof File &&
    data.thumbnailFile.size > 0
  ) {
    const safeThumbName =
      data.thumbnailFile.name
        .replace(/\s+/g, "-")
        .replace(
          /[^a-zA-Z0-9._-]/g,
          "",
        );

    const thumbName =
      `${fileId}-${safeThumbName}`;

    const thumbnailDir =
      path.join(
        process.cwd(),
        "public",
        "uploads",
        "episodes",
        "thumbnails",
      );

    await fs.mkdir(
      thumbnailDir,
      {
        recursive: true,
      },
    );

    const thumbPath =
      path.join(
        thumbnailDir,
        thumbName,
      );

    await fs.writeFile(
      thumbPath,
      Buffer.from(
        await data.thumbnailFile.arrayBuffer(),
      ),
    );

    thumbnailUrl =
      `/uploads/episodes/thumbnails/${thumbName}`;
  }

  // ===================================================
  // DATABASE UPDATE
  // ===================================================

  return repoUpdateEpisode(
    id,
    {
      title: finalTitle,
      episodeNo,
      duration,
      videoUrl,
      thumbnailUrl,
    },
  );
}

// =====================================================
// DELETE
// =====================================================

export function deleteEpisode(
  id: number,
) {
  return repoDeleteEpisode(id);
}