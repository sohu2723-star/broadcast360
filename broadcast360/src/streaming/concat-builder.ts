import fs from "fs";
import path from "path";


export function createConcatFile(
 channelId:number,
 files:string[]
){

 const dir =
 path.join(
  process.cwd(),
  "tmp"
 );


 if(!fs.existsSync(dir)){
  fs.mkdirSync(dir);
 }


 const file =
 path.join(
  dir,
  `channel-${channelId}.txt`
 );


 const content =
 files
 .map(
  f=>`file '${f.replace(/\\/g,"/")}'`
 )
 .join("\n");


 fs.writeFileSync(
  file,
  content
 );


 return file;
}