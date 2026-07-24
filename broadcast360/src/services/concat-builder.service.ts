import fs from "fs";
import path from "path";

import { PlaylistItemWithRelations } from "@/types/playlist";

export class ConcatBuilderService {
  private baseDir = path.join(
    process.cwd(),
    "public",
    "streams",
  );

  async build(
    channelId: number,
    items: PlaylistItemWithRelations[],
  ) {
    const channelDir = path.join(
      this.baseDir,
      `channel-${channelId}`,
    );

    if (!fs.existsSync(channelDir)) {
      fs.mkdirSync(channelDir, {
        recursive: true,
      });
    }


    const concatFile = path.join(
      channelDir,
      "concat.txt",
    );


    const files: string[] = [];


    for (const item of items) {

      let videoPath: string | null = null;


      /*
      ======================
          MOVIE
      ======================
      */

      if (item.movie?.videoUrl) {
        videoPath = item.movie.videoUrl;
      }


      /*
      ======================
          EPISODE
      ======================
      */

      if (item.episode?.videoUrl) {
        videoPath = item.episode.videoUrl;
      }


      /*
      ======================
          ENTERTAINMENT
      ======================
      */

      if (item.entertainment?.videoUrl) {
        videoPath =
          item.entertainment.videoUrl;
      }


      /*
      ======================
          ADVERTISEMENT
      ======================
      */

      if (item.advertisement?.videoUrl) {
        videoPath =
          item.advertisement.videoUrl;
      }


      if (!videoPath) {
        console.log(
          "⚠ Skip item",
          item.id,
          item.type,
        );

        continue;
      }


      const fullPath =
        path.join(
          process.cwd(),
          "public",
          videoPath,
        );


      if (!fs.existsSync(fullPath)) {
        console.log(
          "❌ File missing",
          fullPath,
        );

        continue;
      }


      /*
        FFmpeg concat format
      */

      files.push(
        `file '${fullPath.replace(/\\/g, "/")}'`,
      );
    }


    if (files.length === 0) {
      throw new Error(
        "No valid media files",
      );
    }


    fs.writeFileSync(
      concatFile,
      files.join("\n"),
    );


    console.log(
      "📄 Concat created",
      concatFile,
    );


    return concatFile;
  }
}