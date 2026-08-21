import { getCloudflareContext } from "@opennextjs/cloudflare";

const MAX_UPLOAD_BYTES = 1024 * 1024 * 1024;

type R2BucketLike = {
  put: (
    key: string,
    value: ArrayBuffer | ArrayBufferView | ReadableStream | string,
    options?: { httpMetadata?: { contentType?: string; cacheControl?: string } },
  ) => Promise<unknown>;
};

type R2Config = {
  bucket: string;
  publicBaseUrl: string | null;
};

function getR2Binding(): R2BucketLike | null {
  try {
    const context = getCloudflareContext({ async: false }) as unknown as { env?: { MEDIA_BUCKET?: R2BucketLike } };
    return context.env?.MEDIA_BUCKET ?? null;
  } catch {
    return null;
  }
}

function getR2Config(): R2Config | null {
  const bucket = process.env.R2_BUCKET_NAME?.trim() || "hxu-movie-media";
  const publicBaseUrl = process.env.R2_PUBLIC_BASE_URL?.replace(/\/$/, "") || null;
  if (!bucket && !publicBaseUrl) return null;
  return { bucket, publicBaseUrl };
}

function safeFilename(originalName: string) {
  const normalized = originalName.trim().replace(/\s+/g, "-");
  const safe = normalized.replace(/[^a-zA-Z0-9._-]/g, "");
  return safe || "upload.bin";
}

function encodeObjectKey(objectKey: string) {
  return objectKey.split("/").map(encodeURIComponent).join("/");
}

function publicUrlFor(config: R2Config, objectKey: string) {
  if (!config.publicBaseUrl) {
    throw new Error("R2_PUBLIC_BASE_URL is required for public media delivery");
  }
  return `${config.publicBaseUrl}/${encodeObjectKey(objectKey)}`;
}

function createObjectKey(fileName: string, folder: string) {
  return `${folder.replace(/^\/+|\/+$/g, "")}/${Date.now()}-${crypto.randomUUID()}-${safeFilename(fileName)}`;
}

export function isR2Configured() {
  return Boolean(getR2Binding() && getR2Config());
}

export async function uploadR2MediaFile(file: File, folder: string) {
  const config = getR2Config();
  const bucket = getR2Binding();
  if (!config || !bucket) {
    throw new Error("Cloudflare R2 MEDIA_BUCKET binding is not configured");
  }
  if (!file || file.size <= 0) throw new Error("Uploaded file is empty");
  if (file.size > MAX_UPLOAD_BYTES) throw new Error("File is too large. The maximum allowed size is 1 GB.");

  const objectKey = createObjectKey(file.name, folder);
  await bucket.put(objectKey, await file.arrayBuffer(), {
    httpMetadata: {
      contentType: file.type || "application/octet-stream",
      cacheControl: "public, max-age=3600",
    },
  });
  return publicUrlFor(config, objectKey);
}

export async function createR2DirectUpload(input: {
  folder: string;
  filename: string;
  contentType?: string;
  size: number;
}) {
  const config = getR2Config();
  if (!config || !getR2Binding()) {
    throw new Error("Cloudflare R2 MEDIA_BUCKET binding is not configured");
  }
  if (!Number.isFinite(input.size) || input.size <= 0) throw new Error("Uploaded file is empty");
  if (input.size > MAX_UPLOAD_BYTES) throw new Error("File is too large. The maximum allowed size is 1 GB.");

  const path = createObjectKey(input.filename, input.folder);
  return {
    bucket: config.bucket,
    path,
    publicUrl: publicUrlFor(config, path),
    contentType: input.contentType || "application/octet-stream",
  };
}
