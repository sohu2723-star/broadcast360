import { z } from "zod";

// Shared File Validation Helper
const fileSchema = z.instanceof(File).refine((file) => file.size > 0, {
  message: "File must not be empty",
});

export const createAdvertisementSchema = z.object({
  title: z.string().min(1, { message: "Required Advertisement Title" }),
  active: z.preprocess((val) => val === "true" || val === true || val === "1" || val === 1, z.boolean()),
  video: fileSchema, 
  thumbnail: fileSchema.optional(),
});


export const updateAdvertisementSchema = z.object({
  title: z.string().min(1, { message: "Required Advertisement Title" }),
  active: z.preprocess((val) => val === "true" || val === true || val === "1" || val === 1, z.boolean()),
  video: fileSchema.optional(), 
  thumbnail: fileSchema.optional(),
});