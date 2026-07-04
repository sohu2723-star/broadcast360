import { z } from "zod";

const baseAdvertisementSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(100, "Title must be less than 100 characters"),

  active: z.preprocess(
    (val) => val === "true" || val === true,
    z.boolean()
  ),
});

export const createAdvertisementSchema = baseAdvertisementSchema.extend({
  video: z.instanceof(File, {
    message: "Advertisement video file is required",
  }),
});

export const editAdvertisementSchema = baseAdvertisementSchema.extend({
  video: z.instanceof(File).nullable().optional(),
});