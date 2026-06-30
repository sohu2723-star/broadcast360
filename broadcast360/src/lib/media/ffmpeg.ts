import ffmpeg from "fluent-ffmpeg";
import path from "path";

type VideoInfo = {
  duration: number;
  thumbnail: string;
};

// ========================
// GET VIDEO DURATION
// ========================
export function getVideoDuration(filePath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, data) => {
      if (err) {
        reject(err);
        return;
      }

      const duration = Math.floor(data.format?.duration ?? 0);

      resolve(duration);
    });
  });
}

// ========================
// GENERATE THUMBNAIL
// ========================
export function generateThumbnail(
  videoPath: string,
  outputPath: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .screenshots({
        timestamps: ["00:00:01"],
        filename: path.basename(outputPath),
        folder: path.dirname(outputPath),
        size: "320x180",
      })
      .on("end", () => resolve(outputPath))
      .on("error", (err) => reject(err));
  });
}

// ========================
// GET FULL VIDEO INFO
// ========================
export async function getVideoInfo(
  filePath: string,
  thumbnailOutputPath: string
): Promise<VideoInfo> {
  const duration = await getVideoDuration(filePath);

  const thumbnail = await generateThumbnail(
    filePath,
    thumbnailOutputPath
  );

  return {
    duration,
    thumbnail,
  };
}