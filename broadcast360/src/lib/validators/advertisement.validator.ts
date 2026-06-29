import { z } from "zod";

const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/quicktime", "video/mkv", "video/x-matroska"];

export const advertisementSchema = z.object({
  title: z.string().min(1, "Title is required"),
  active: z.preprocess((val) => val === "true", z.boolean()),
  videoFile: z
    .any()
    .refine((file) => file instanceof File, "Video file is required")
    .refine(
      (file: File) => ALLOWED_VIDEO_TYPES.includes(file?.type),
      "Invalid video format. Only MP4, MOV, and MKV are allowed."
    ),
});