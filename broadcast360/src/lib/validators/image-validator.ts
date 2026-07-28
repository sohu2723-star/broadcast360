import sharp from "sharp";

export type ImageType = "POSTER" | "LANDSCAPE";

export async function validateImage(buffer: Buffer, type: ImageType) {
  const metadata = await sharp(buffer).metadata();

  const width = metadata.width ?? 0;
  const height = metadata.height ?? 0;

  const ratio = width / height;

  const expected = type === "POSTER" ? 2 / 3 : 16 / 9;

  const valid = Math.abs(ratio - expected) <= 0.05;

  return {
    valid,
    width,
    height,
    message: valid
      ? "Valid image."
      : `Expected ${type === "POSTER" ? "2:3" : "16:9"} aspect ratio.`,
  };
}
