import { z } from "zod";


export const playlistItemSchema = z.object({

  type: z.enum([
    "MOVIE",
    "EPISODE",
    "ADVERTISEMENT",
    "ENTERTAINMENT",
    "NEWS",
    "STREAM",
  ]),


  contentId: z
    .number()
    .int()
    .positive(),


  order: z
    .number()
    .int()
    .positive(),


});


export type PlaylistItemValidator =
z.infer<typeof playlistItemSchema>;