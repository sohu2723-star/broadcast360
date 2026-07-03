import { z } from "zod";


export const updatePlaylistSchema = z.object({

  name:z
    .string()
    .min(
      3,
      "Playlist name must be at least 3 characters"
    )

});