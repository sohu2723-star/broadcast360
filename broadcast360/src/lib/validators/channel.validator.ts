import { z } from "zod";

/* ================= BASE SCHEMA ================= */
export const baseChannelSchema = z.object({
  name: z.string().trim().min(1, "Channel name is required"),
  country: z.string().trim().min(1, "Country is required"),
  logo: z.string().trim().min(1, "Channel logo is required"),
  description: z.string().trim().min(1, "Description is required"),
});

/* ================= CREATE ================= */
export const createChannelSchema = baseChannelSchema;

/* ================= UPDATE ================= */
export const updateChannelSchema = baseChannelSchema;