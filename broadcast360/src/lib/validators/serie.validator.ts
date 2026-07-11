import { z } from "zod";

const currentYear = new Date().getFullYear();

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
    .trim()
    .min(1, "Genre is required"),

 releaseYear: z
    .union([
      z.literal(""),
      z.number(),
    ])
    .refine((value) => value !== "", {
      message: "Release year is required",
    })
    .refine((value) => /^\d{4}$/.test(String(value)), {
      message: "Release year must be a 4-digit year",
    })
    .refine((value) => value >= 1900, {
      message: "Release year must be 1900 or later",
    })
    .refine((value) => value <= currentYear, {
      message: `Release year cannot be later than ${currentYear}`,
    }),
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
  thumbnail: z.instanceof(File).optional().nullable(),
});