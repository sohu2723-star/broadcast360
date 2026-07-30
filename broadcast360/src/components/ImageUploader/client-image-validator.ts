export type ImageType = "POSTER" | "LANDSCAPE";

export interface ImageValidationResult {
  valid: boolean;
  width: number;
  height: number;
  fileSize: number;
  expectedRatio: string;
  currentRatio: string;
  message: string;
}

const TOLERANCE = 0.05;

export async function validateClientImageRatio(
  file: File,
  type: ImageType,
): Promise<ImageValidationResult> {
  return new Promise((resolve) => {
    const img = new Image();

    img.onload = () => {
      const width = img.width;
      const height = img.height;

      const expected = type === "POSTER" ? 2 / 3 : 16 / 9;
      const expectedRatio = type === "POSTER" ? "2:3" : "16:9";

      const actual = width / height;

      const valid = Math.abs(actual - expected) <= TOLERANCE;

      resolve({
        valid,
        width,
        height,
        fileSize: file.size,
        expectedRatio,
        currentRatio: `${width}:${height}`,
        message: valid
          ? "Image is valid."
          : `Expected ${expectedRatio} aspect ratio.`,
      });

      URL.revokeObjectURL(img.src);
    };

    img.src = URL.createObjectURL(file);
  });
}
