import { z } from "zod";

videoFile: z.any().optional().nullable()
const baseEpisodeSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(200, "Title is too long"),

  episodeNo: z.coerce
    .number()
    .int("Episode number must be an integer")
    .positive("Episode number must be greater than 0"),
});

// =======================
// CREATE (video required)
// =======================
export const createEpisodeSchema = baseEpisodeSchema.extend({
  videoFile: z.instanceof(File, {
    message: "Video file is required",
  }),
});

// =======================
// EDIT (video optional SAFE)
// =======================
export const editEpisodeSchema = baseEpisodeSchema.extend({
  videoFile: z
    .any()
    .optional()
    .nullable()
    .refine(
      (file) => {
        if (!file) return true; // allow empty in edit
        return file instanceof File;
      },
      { message: "Invalid video file" }
    ),
});

// =======================
// TYPES
// =======================
export type CreateEpisodeDTO = z.infer<typeof createEpisodeSchema>;
export type EditEpisodeDTO = z.infer<typeof editEpisodeSchema>;