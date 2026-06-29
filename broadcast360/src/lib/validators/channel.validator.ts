import { z } from "zod";


export const createChannelSchema = z.object({

  name: z.string()
    .trim()
    .min(1,"Channel name is required"),

  country: z.string()
    .trim()
    .min(1,"Country is required"),

  logo: z.string()
    .trim()
    .min(1,"Channel logo is required"),

  description: z.string()
    .trim()
    .min(1,"Description is required"),

});

export const updateChannelSchema = z.object({

  name: z.string()
    .trim()
    .min(1,"Channel name is required"),


  country: z.string()
    .trim()
    .min(1,"Country is required"),


  logo: z.string()
    .trim()
    .optional(),

  description: z.string()
    .trim()
    .min(1,"Description is required"),

});