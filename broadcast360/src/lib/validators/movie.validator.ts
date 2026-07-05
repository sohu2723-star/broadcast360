import { z } from "zod";

const baseMovieSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Movie title is required")
    .max(100, "Movie title must be less than 100 characters"),

  description: z
    .string()
    .trim()
    .min(1, "Description is required")
    .max(1000, "Description is too long"),

  genre: z.string().min(1, "Genre is required"),

  thumbnail: z
    .instanceof(File, {
      message: "Thumbnail is required",
    })
    .refine(
      (file) =>
        ["image/jpeg", "image/png", "image/webp"].includes(file.type),
      "Invalid image format"
    ),

  releaseYear: z
    .union([z.string(), z.number()])
    .transform((val) => {
      if (val === "" || val === null || val === undefined) return NaN;
      return Number(val);
    })
    .refine((val) => !isNaN(val), "Release year is required")
    .refine((val) => Number.isInteger(val), "Invalid year")
    .refine((val) => val >= 1900, "Release year must be after 1900")
    .refine(
      (val) => val <= new Date().getFullYear(),
      "Release year cannot be in the future"
    ),

    
});

export const createMovieSchema = baseMovieSchema.extend({
  video: z
    .instanceof(File, {
      message: "Movie file is required",
    })
    .refine(
      (file) =>
        ["video/mp4", "video/webm", "video/quicktime"].includes(file.type),
      "Invalid video format"
    ),
});

export const editMovieSchema = baseMovieSchema.extend({
  video: z.instanceof(File).nullable().optional(),
});