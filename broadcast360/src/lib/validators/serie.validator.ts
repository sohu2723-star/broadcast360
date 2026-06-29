import { z } from "zod";

const baseSeriesSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Series title is required")
    .max(100, "Series title must be less than 100 characters"),

  description: z
    .string()
    .trim()
    .min(1, "Description is required")
    .max(1000, "Description is too long"),

  genre: z
    .string()
    .min(1, "Genre is required"),

  releaseYear: z
    .number()
    .min(1900, "Invalid year")
    .max(new Date().getFullYear(), "Year cannot be in future"),
});

/* =========================
   CREATE (thumbnail REQUIRED)
========================= */
export const createSeriesSchema = baseSeriesSchema.extend({
  thumbnail: z.instanceof(File, {
    message: "Thumbnail is required",
  }),
});

/* =========================
   EDIT (thumbnail OPTIONAL)
========================= */
export const editSeriesSchema = baseSeriesSchema.extend({
  thumbnail: z
    .instanceof(File)
    .optional()
    .nullable(),
});