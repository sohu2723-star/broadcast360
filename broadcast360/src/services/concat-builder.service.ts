import fs from "fs";
import path from "path";

import { PlaylistItemWithRelations } from "@/types/playlist";

export class ConcatBuilderService {
  /*
  ==========================================
       CREATE FFMPEG CONCAT FILE
  ==========================================

  Output:

  tmp/concat/channel-1.txt


  file 'movie1.mp4'
  file 'movie2.mp4'
  file 'ads.mp4'

  ==========================================
  */

  async build(
    channelId: number,
    items: PlaylistItemWithRelations[],
  ): Promise<string> {
    const folder = path.join(process.cwd(), "tmp", "concat");

    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, {
        recursive: true,
      });
    }

    const concatFile = path.join(folder, `channel-${channelId}.txt`);

    const files: string[] = [];

    for (const item of items) {
      const file = this.resolveItem(item);

      if (!file) {
        console.log("⚠ Skip item without video", {
          id: item.id,
          type: item.type,
        });

        continue;
      }

      if (!fs.existsSync(file)) {
        console.log("❌ File not found", file);

        continue;
      }

      files.push(`file '${file.replace(/\\/g, "/")}'`);
    }

    if (files.length === 0) {
      throw new Error("No playable playlist items");
    }

    fs.writeFileSync(concatFile, files.join("\n"), "utf8");

    console.log("✅ CONCAT READY", {
      channelId,
      count: files.length,
      concatFile,
    });

    return concatFile;
  }

  /*
  ==========================================
       RESOLVE PLAYLIST ITEM
  ==========================================
  */

  private resolveItem(item: PlaylistItemWithRelations): string | null {
    let url: string | null = null;

    switch (item.type) {
      case "MOVIE":
        url = item.movie?.videoUrl ?? null;

        break;

      case "EPISODE":
        url = item.episode?.videoUrl ?? null;

        break;

      case "ADVERTISEMENT":
        url = item.advertisement?.videoUrl ?? null;

        break;

      case "ENTERTAINMENT":
        url = item.entertainment?.videoUrl ?? null;

        break;

      case "NEWS":
        url = item.news?.videoUrl ?? null;

        break;

      default:
        return null;
    }

    if (!url) {
      return null;
    }

    /*
      Database:

      /videos/movies/a.mp4


      Convert:

      C:\broadcast360\public\videos\movies\a.mp4

    */

    return path.join(process.cwd(), "public", url);
  }
}
