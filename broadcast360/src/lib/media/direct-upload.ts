"use client";

export type DirectUploadFolder =
  | "videos/movies"
  | "thumbnails/movies"
  | "videos/ads"
  | "thumbnails/ads"
  | "videos/entertainments"
  | "thumbnails/entertainments"
  | "videos/episodes"
  | "thumbnails/episodes"
  | "logos";

export async function uploadAdminFileDirect(file: File, folder: DirectUploadFolder) {
  if (!file || file.size <= 0) {
    throw new Error("Selected file is empty");
  }

  const formData = new FormData();
  formData.append("folder", folder);
  formData.append("file", file, file.name);

  const response = await fetch("/api/upload/direct", {
    method: "POST",
    body: formData,
  });
  const body = await response.json().catch(() => ({}));

  if (!response.ok || !body.publicUrl) {
    throw new Error(body.message || `Unable to upload file (HTTP ${response.status})`);
  }

  return {
    path: String(body.path || folder),
    publicUrl: String(body.publicUrl),
  };
}
