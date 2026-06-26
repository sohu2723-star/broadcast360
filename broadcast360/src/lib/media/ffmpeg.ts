import ffmpeg from "fluent-ffmpeg";
import path from "path";

type VideoInfo = {

duration:number;

thumbnail:string;

};


export function getVideoInfo(
filePath:string
):Promise<VideoInfo>{

return new Promise((resolve,reject)=>{

ffmpeg.ffprobe(

filePath,

(err,data)=>{

if(err){

reject(err);
return;
}

const duration = Math.floor(
data.format.duration ?? 0
);



resolve({

duration,

thumbnail:""

});


}

);


});


}

export function getVideoDuration(
  filePath: string
): Promise<number> {

  return new Promise((resolve, reject) => {

    ffmpeg.ffprobe(filePath, (err, data) => {

      if (err) {
        reject(err);
        return;
      }

      const duration = Math.floor(
        data.format.duration ?? 0
      );

      resolve(duration);

    });

  });

}

export function generateThumbnail(
  videoPath: string,
  outputPath: string
): Promise<string> {

  return new Promise((resolve, reject) => {

    ffmpeg(videoPath)
      .screenshots({
        timestamps: ["00:00:01"],
        filename: path.basename(outputPath),
        folder: path.dirname(outputPath),
        size: "320x180"
      })
      .on("end", () => {
        resolve(outputPath);
      })
      .on("error", (err) => {
        reject(err);
      });

  });

}