import fs from "fs/promises";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import { isR2Configured, createR2SignedUpload, uploadR2MediaFile } from "./r2-storage";

const DEFAULT_BUCKET = "hxu-movie-media";

function getStorageConfig() {
  const baseUrl = process.env.SUPABASE_URL?.replace(/\/$/, "");
  const apiKey = process.env.SUPABASE_KEY;

  if (!baseUrl || !apiKey) return null;

  return {
    baseUrl,
    apiKey,
    bucket: process.env.SUPABASE_STORAGE_BUCKET || DEFAULT_BUCKET,
  };
}

function safeFilename(originalName: string) {
  const normalized = originalName.trim().replace(/\s+/g, "-");
  const safe = normalized.replace(/[^a-zA-Z0-9._-]/g, "");
  return safe || "upload.bin";
}

function encodeStoragePath(storagePath: string) {
  return storagePath.split("/").map(encodeURIComponent).join("/");
}

function contentTypeFor(file: File) {
  return file.type || "application/octet-stream";
}

export async function createSignedMediaUpload(input: {
  folder: string;
  filename: string;
  contentType?: string;
  size: number;
}) {
  if (!Number.isFinite(input.size) || input.size <= 0) {
    throw new Error("Uploaded file is empty");
  }

  if (isR2Configured()) {
    return createR2SignedUpload(input);
  }

  const config = getStorageConfig();
  if (!config) {
    throw new Error("Supabase Storage is not configured");
  }

  const client = createClient(config.baseUrl, config.apiKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
  const storagePath = `${input.folder.replace(/^\/+|\/+$/g, "")}/${Date.now()}-${crypto.randomUUID()}-${safeFilename(input.filename)}`;
  const { data, error } = await client.storage
    .from(config.bucket)
    .createSignedUploadUrl(storagePath, { upsert: false });

  if (error || !data) {
    throw new Error(error?.message || "Unable to create signed upload URL");
  }

  const publicUrl = `${config.baseUrl}/storage/v1/object/public/${config.bucket}/${encodeStoragePath(storagePath)}`;
  return {
    bucket: config.bucket,
    path: storagePath,
    token: data.token,
    signedUrl: data.signedUrl,
    publicUrl,
    contentType: input.contentType || "application/octet-stream",
  };
}

export async function uploadMediaFile(file: File, folder: string) {
  if (!file || file.size <= 0) {
    throw new Error("Uploaded file is empty");
  }

  if (isR2Configured()) {
    return uploadR2MediaFile(file, folder);
  }

  const filename = `${Date.now()}-${safeFilename(file.name)}`;
  const storagePath = `${folder.replace(/^\/+|\/+$/g, "")}/${filename}`;
  const bytes = Buffer.from(await file.arrayBuffer());
  const config = getStorageConfig();

  if (config) {
    const objectUrl = `${config.baseUrl}/storage/v1/object/${config.bucket}/${encodeStoragePath(storagePath)}`;
    const response = await fetch(objectUrl, {
      method: "POST",
      headers: {
        apikey: config.apiKey,
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": contentTypeFor(file),
        "x-upsert": "false",
      },
      body: bytes,
    });

    if (!response.ok) {
      const details = await response.text().catch(() => "");
      throw new Error(
        `Media upload failed (${response.status})${details ? `: ${details.slice(0, 240)}` : ""}`,
      );
    }

    return `${config.baseUrl}/storage/v1/object/public/${config.bucket}/${encodeStoragePath(storagePath)}`;
  }

  if (process.env.VERCEL === "1" || process.env.NODE_ENV === "production") {
    throw new Error(
      "Supabase Storage is not configured for production media uploads",
    );
  }

  const localDirectory = path.join(process.cwd(), "public", folder);
  await fs.mkdir(localDirectory, { recursive: true });
  await fs.writeFile(path.join(localDirectory, filename), bytes);
  return `/${storagePath}`;
}

export async function writeTemporaryMediaFile(file: File, prefix: string) {
  const filename = `${prefix}-${Date.now()}-${safeFilename(file.name)}`;
  const temporaryPath = path.join("/tmp", filename);
  await fs.writeFile(temporaryPath, Buffer.from(await file.arrayBuffer()));
  return temporaryPath;
}

export async function removeTemporaryMediaFile(temporaryPath: string) {
  await fs.rm(temporaryPath, { force: true }).catch(() => undefined);
}
