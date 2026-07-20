import { PlaylistResolverService } from "@/services/playlist-resolver.service";
import fs from "fs";
import path from "path";

export class ConcatManager {

  create(
    channelId:number,
    items:any[],
    loop:boolean = false
  ){

    const folder = path.join(
      process.cwd(),
      "temp"
    );


    fs.mkdirSync(folder,{
      recursive:true
    });



    const filePath = path.join(
      folder,
      `channel-${channelId}.txt`
    );


    const resolver =
      new PlaylistResolverService();



    const paths =
      resolver.resolve(items);



    let finalPaths = paths;


    /*
      fallback playlist

      movie1
      movie2
      movie3

      becomes

      movie1
      movie2
      movie3
      movie1
      movie2
      movie3
    */

    if(loop){

      finalPaths = [
        ...paths,
        ...paths,
        ...paths,
        ...paths,
        ...paths,
      ];

    }



    const content =
      finalPaths
      .map(videoUrl=>{

        const fullPath =
          path.join(
            process.cwd(),
            "public",
            videoUrl
          );


        return `file '${fullPath.replace(/\\/g,"/")}'`;

      })
      .join("\n");



    fs.writeFileSync(
      filePath,
      content
    );


    console.log(
      "📄 Concat created:",
      filePath
    );


    return filePath;

  }

}