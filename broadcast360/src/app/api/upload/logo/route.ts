import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(request:Request){

const formData = await request.formData();
const file = formData.get("file") as File;

if(!file){
return NextResponse.json(
{message:"No file"},
{status:400}
);
}

const bytes = await file.arrayBuffer();
const buffer = Buffer.from(bytes);
const fileName = file.name;
const uploadPath = path.join(
process.cwd(),
"public",
"logos",
fileName
);

fs.writeFileSync(
uploadPath,
buffer
);

return NextResponse.json({
url:`/logos/${fileName}`
});
}