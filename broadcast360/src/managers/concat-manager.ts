import fs from "fs/promises";
import path from "path";

import { ResolvedPlaylistItem } from "@/types/playlist";

export class ConcatManager {
  private folder = path.join(process.cwd(), "storage", "concat");

  /*
  ==========================
      CREATE CONCAT FILE
  ==========================
  */

  async create(
    channelId: number,
    items: ResolvedPlaylistItem[],
  ): Promise<string> {
    await fs.mkdir(this.folder, {
      recursive: true,
    });

    const lines: string[] = [];

    for (const item of items) {
      /*
        STREAM handled by LiveManager
      */

      if (item.type === "STREAM") {
        continue;
      }

      if (!item.videoUrl) {
        console.log(" SKIP ITEM WITHOUT VIDEO", item.id);

        continue;
      }

      const filePath = path
        .join(process.cwd(), "public", item.videoUrl)
        .replace(/\\/g, "/");

      console.log("ADD CONCAT FILE", filePath);

      lines.push(`file '${filePath}'`);
    }

    if (lines.length === 0) {
      throw new Error("NO VIDEO FOR CONCAT");
    }

    const concatPath = path.join(this.folder, `channel-${channelId}.txt`);

    await fs.writeFile(concatPath, lines.join("\n"), "utf-8");

    console.log("📄 CONCAT CREATED", {
      channelId,
      concatPath,
      total: lines.length,
    });

    return concatPath;
  }

  /*
  ==========================
       REMOVE
  ==========================
  */

  async remove(channelId: number) {
    const file = path.join(this.folder, `channel-${channelId}.txt`);

    try {
      await fs.unlink(file);

      console.log("🗑 CONCAT REMOVED", channelId);
    } catch {}
  }
}
