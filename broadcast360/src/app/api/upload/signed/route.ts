import { NextRequest, NextResponse } from "next/server";
import { getAdminFromRequest } from "@/lib/admin-auth";
import { createSignedMediaUpload } from "@/lib/media/storage";

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
    return NextResponse.json(
      { message: "Admin authentication is required" },
      { status: 401 },
    );
  }

  try {
    const body = (await request.json()) as {
      folder?: unknown;
      filename?: unknown;
      contentType?: unknown;
      size?: unknown;
    };
    const folder = typeof body.folder === "string" ? body.folder : "";
    const filename = typeof body.filename === "string" ? body.filename : "";
    const contentType =
      typeof body.contentType === "string" ? body.contentType : "";
    const size = typeof body.size === "number" ? body.size : Number(body.size);

    if (!ALLOWED_FOLDERS.has(folder)) {
      return NextResponse.json({ message: "Unsupported upload folder" }, { status: 400 });
    }
    if (!filename.trim()) {
      return NextResponse.json({ message: "Filename is required" }, { status: 400 });
    }
    if (!Number.isFinite(size) || size <= 0) {
      return NextResponse.json({ message: "File size is invalid" }, { status: 400 });
    }
    if (size > MAX_UPLOAD_BYTES) {
      return NextResponse.json(
        { message: "File is too large. The maximum allowed size is 1 GB." },
        { status: 413 },
      );
    }

    const upload = await createSignedMediaUpload({
      folder,
      filename,
      contentType,
      size,
    });

    return NextResponse.json(upload, { status: 201 });
  } catch (error) {
    console.error("SIGNED UPLOAD ERROR:", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Unable to prepare the upload",
      },
      { status: 500 },
    );
  }
}
