import { NextRequest, NextResponse } from "next/server";

import { getAdminFromRequest } from "@/lib/admin-auth";
import { uploadMediaFile } from "@/lib/media/storage";

const ALLOWED_FOLDERS = new Set([
  "videos/movies",
  "thumbnails/movies",
  "videos/ads",
  "thumbnails/ads",
  "videos/entertainments",
  "thumbnails/entertainments",
  "videos/episodes",
  "thumbnails/episodes",
  "logos",
]);

const MAX_UPLOAD_BYTES = 1024 * 1024 * 1024;

export async function POST(request: NextRequest) {
  const admin = await getAdminFromRequest(request);
  if (!admin) {
    return NextResponse.json({ message: "Admin authentication is required" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const folder = String(formData.get("folder") ?? "");
    const file = formData.get("file");

    if (!ALLOWED_FOLDERS.has(folder)) {
      return NextResponse.json({ message: "Unsupported upload folder" }, { status: 400 });
    }
    if (!(file instanceof File) || file.size <= 0) {
      return NextResponse.json({ message: "A non-empty file is required" }, { status: 400 });
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json({ message: "File is too large. The maximum allowed size is 1 GB." }, { status: 413 });
    }

    const publicUrl = await uploadMediaFile(file, folder);
    return NextResponse.json({ path: folder, publicUrl }, { status: 201 });
  } catch (error) {
    console.error("DIRECT UPLOAD ERROR:", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unable to upload file" },
      { status: 500 },
    );
  }
}
