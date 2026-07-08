import { PlaylistResolverService } from "@/services/playlist-resolver.service";
import fs from "fs";
import path from "path";

export class ConcatManager {

  create(
    channelId: number,
    items: any[]
  ) {

    const folder = path.join(
      process.cwd(),
      "temp"
    );

    fs.mkdirSync(folder, {
      recursive: true,
    });


    const filePath = path.join(
      folder,
      `channel-${channelId}.txt`
    );


    const resolver = new PlaylistResolverService();

const paths = resolver.resolve(items);

const content = paths
  .map((videoUrl) => {
    const fullPath = path.join(
      process.cwd(),
      "public",
      videoUrl
    );

    return `file '${fullPath.replace(/\\/g, "/")}'`;
  })
  .join("\n");


    fs.writeFileSync(
      filePath,
      content
    );


    console.log(
      "📄 Concat file:",
      filePath
    );


    return filePath;
  }

}