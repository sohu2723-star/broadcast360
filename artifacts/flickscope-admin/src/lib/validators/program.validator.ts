const ProgramType = ["MOVIE", "SERIES_EPISODE", "NEWS", "ADVERTISEMENT"] as const;
import { z } from "zod";


export const createProgramSchema = z.object({

  channelId: z
    .number()
    .min(1, "Channel is required"),


  title: z
    .string()
    .trim()
    .min(1, "Program title is required"),


  type: z.enum([
    "MOVIE",
    "SERIES",
    "NEWS",
    "LIVE",
    "ENTERTAINMENT",
  ]),


  description: z
    .string()
    .trim()
    .min(1, "Description is required"),


});

export const updateProgramSchema =
z.object({

 channelId:
 z.number()
 .min(1,"Channel is required"),


 title:
 z.string()
 .trim()
 .min(1,"Program title is required"),


 type:
 z.enum(ProgramType),


 description:
 z.string()
 .trim()
 .min(1,"Description is required")

});