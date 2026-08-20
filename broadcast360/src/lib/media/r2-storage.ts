import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const MAX_SIGNED_UPLOAD_BYTES = 1024 * 1024 * 1024;

function getR2Config() {
  const accountId = process.env.R2_ACCOUNT_ID?.trim();
  const accessKeyId = process.env.R2_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY?.trim();
  const bucket = process.env.R2_BUCKET_NAME?.trim();

  if (!accountId || !accessKeyId || !secretAccessKey || !bucket) {
    return null;
  }

  return {
    accountId,
    accessKeyId,
    secretAccessKey,
    bucket,
    publicBaseUrl: process.env.R2_PUBLIC_BASE_URL?.replace(/\/$/, "") || null,
  };
}

function safeFilename(originalName: string) {
  const normalized = originalName.trim().replace(/\s+/g, "-");
  const safe = normalized.replace(/[^a-zA-Z0-9._-]/g, "");
  return safe || "upload.bin";
}

function encodeObjectKey(objectKey: string) {
  return objectKey.split("/").map(encodeURIComponent).join("/");
}

function createClient(config: NonNullable<ReturnType<typeof getR2Config>>) {
  return new S3Client({
    region: "auto",
    endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });
}

function publicUrlFor(
  config: NonNullable<ReturnType<typeof getR2Config>>,
  objectKey: string,
) {
  if (config.publicBaseUrl) {
    return `${config.publicBaseUrl}/${encodeObjectKey(objectKey)}`;
  }

  return `https://${config.accountId}.r2.cloudflarestorage.com/${config.bucket}/${encodeObjectKey(objectKey)}`;
}

export function isR2Configured() {
  return Boolean(getR2Config());
}

export async function uploadR2MediaFile(file: File, folder: string) {
  const config = getR2Config();
  if (!config) {
    throw new Error("Cloudflare R2 is not configured");
  }
  if (!file || file.size <= 0) {
    throw new Error("Uploaded file is empty");
  }

  const objectKey = `${folder.replace(/^\/+|\/+$/g, "")}/${Date.now()}-${crypto.randomUUID()}-${safeFilename(file.name)}`;
  const client = createClient(config);
  await client.send(
    new PutObjectCommand({
      Bucket: config.bucket,
      Key: objectKey,
      Body: Buffer.from(await file.arrayBuffer()),
      ContentType: file.type || "application/octet-stream",
      CacheControl: "public, max-age=3600",
    }),
  );

  return publicUrlFor(config, objectKey);
}

export async function createR2SignedUpload(input: {
  folder: string;
  filename: string;
  contentType?: string;
  size: number;
}) {
  const config = getR2Config();
  if (!config) {
    throw new Error(
      "Cloudflare R2 is not configured. Add R2_ACCOUNT_ID, R2_BUCKET_NAME, R2_ACCESS_KEY_ID, and R2_SECRET_ACCESS_KEY.",
    );
  }

  if (!Number.isFinite(input.size) || input.size <= 0) {
    throw new Error("Uploaded file is empty");
  }

  if (input.size > MAX_SIGNED_UPLOAD_BYTES) {
    throw new Error("File is too large. The maximum allowed size is 1 GB.");
  }

  const folder = input.folder.replace(/^\/+|\/+$/g, "");
  const objectKey = `${folder}/${Date.now()}-${crypto.randomUUID()}-${safeFilename(input.filename)}`;
  const contentType = input.contentType || "application/octet-stream";
  const client = createClient(config);
  const command = new PutObjectCommand({
    Bucket: config.bucket,
    Key: objectKey,
    ContentType: contentType,
    CacheControl: "public, max-age=3600",
  });
  const signedUrl = await getSignedUrl(client, command, { expiresIn: 300 });

  return {
    bucket: config.bucket,
    path: objectKey,
    signedUrl,
    publicUrl: publicUrlFor(config, objectKey),
    contentType,
    uploadHeaders: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=3600",
    },
  };
}
