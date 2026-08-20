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

export async function uploadAdminFileDirect(
  file: File,
  folder: DirectUploadFolder,
) {
  if (!file || file.size <= 0) {
    throw new Error("Selected file is empty");
  }

  const signedResponse = await fetch("/api/upload/signed", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      folder,
      filename: file.name,
      contentType: file.type,
      size: file.size,
    }),
  });
  const signedBody = await signedResponse.json().catch(() => ({}));

  if (!signedResponse.ok || !signedBody.signedUrl || !signedBody.publicUrl) {
    throw new Error(
      signedBody.message ||
        `Unable to prepare upload (HTTP ${signedResponse.status})`,
    );
  }

  const uploadBody = new FormData();
  uploadBody.append("cacheControl", "3600");
  uploadBody.append("", file);

  const uploadResponse = await fetch(signedBody.signedUrl as string, {
    method: "PUT",
    headers: { "x-upsert": "false" },
    body: uploadBody,
  });
  const uploadText = await uploadResponse.text().catch(() => "");

  if (!uploadResponse.ok) {
    throw new Error(
      `Storage upload failed (HTTP ${uploadResponse.status})${uploadText ? `: ${uploadText.slice(0, 180)}` : ""}`,
    );
  }

  return {
    path: signedBody.path as string,
    publicUrl: signedBody.publicUrl as string,
  };
}
