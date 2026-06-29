import ffmpeg from "fluent-ffmpeg";
import {prisma} from "@/lib/prisma";
import { dbCreateAdvertisement } from "@/repositories/advertisement.repository";

export async function checkTitleExists(title: string): Promise<boolean> {
  const existingAd = await prisma.advertisement.findFirst({
    where: {
      title: {
        equals: title.trim(),
        mode: 'insensitive' 
      }
    }
  });
  return !!existingAd;
}
const extractVideoMetadata = (filePath: string): Promise<{ duration: number; format: string; resolution: string }> => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) return reject(err);
      
      const stream = metadata.streams.find(s => s.codec_type === "video");
      const duration = metadata.format.duration ? Math.round(metadata.format.duration) : 0;
      const format = metadata.format.format_name?.split(",")[0] || "unknown";
      const resolution = stream ? `${stream.width}x${stream.height}` : "unknown";
      
      resolve({ duration, format, resolution });
    });
  });
};

export async function addAdvertisement(
  filePath: string,
  inputData: { title: string; videoUrl: string; size: string; active: boolean }
) {
  let videoMeta = { duration: 0, format: "unknown", resolution: "unknown" };
  
  try {
    videoMeta = await extractVideoMetadata(filePath);
  } catch (ffmpegErr) {
    console.error("FFmpeg processing failed:", ffmpegErr);
  }

  return await dbCreateAdvertisement({
    title: inputData.title,
    videoUrl: inputData.videoUrl,
    duration: videoMeta.duration,
   // format: videoMeta.format,
    //resolution: videoMeta.resolution,
   // size: inputData.size,
    active: inputData.active,
  });
}