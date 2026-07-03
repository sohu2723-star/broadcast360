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

  releaseYear: z
    .number()
    .min(1900, "Release year must be after 1900")
    .max(
      new Date().getFullYear(),
      "Release year cannot be in the future"
    ),

    
});

export const createMovieSchema = baseMovieSchema.extend({
  video: z.instanceof(File, {
    message: "Movie file is required",
  }),
});

export const editMovieSchema = baseMovieSchema.extend({
  video: z.instanceof(File).nullable().optional(),
});