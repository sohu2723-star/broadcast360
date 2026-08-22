export type ImageType = "POSTER" | "LANDSCAPE";

type Dimensions = {
  width: number;
  height: number;
};

function getImageDimensions(buffer: Buffer): Dimensions {
  if (buffer.length >= 24 && buffer.toString("hex", 0, 8) === "89504e470d0a1a0a") {
    return {
      width: buffer.readUInt32BE(16),
      height: buffer.readUInt32BE(20),
    };
  }

  if (buffer.length >= 10 && (buffer.toString("ascii", 0, 6) === "GIF87a" || buffer.toString("ascii", 0, 6) === "GIF89a")) {
    return {
      width: buffer.readUInt16LE(6),
      height: buffer.readUInt16LE(8),
    };
  }

  if (buffer.length >= 30 && buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP") {
    const chunk = buffer.toString("ascii", 12, 16);
    if (chunk === "VP8X") {
      return {
        width: 1 + buffer.readUIntLE(24, 3),
        height: 1 + buffer.readUIntLE(27, 3),
      };
    }
  }

  if (buffer.length >= 4 && buffer[0] === 0xff && buffer[1] === 0xd8) {
    let offset = 2;
    while (offset + 9 < buffer.length) {
      if (buffer[offset] !== 0xff) {
        offset += 1;
        continue;
      }

      const marker = buffer[offset + 1];
      offset += 2;
      if (marker === 0xd8 || marker === 0xd9) continue;
      if (offset + 2 > buffer.length) break;

      const length = buffer.readUInt16BE(offset);
      if (length < 2 || offset + length > buffer.length) break;

      const isStartOfFrame =
        marker >= 0xc0 &&
        marker <= 0xc3 ||
        marker >= 0xc5 &&
        marker <= 0xc7 ||
        marker >= 0xc9 &&
        marker <= 0xcb ||
        marker >= 0xcd &&
        marker <= 0xcf;

      if (isStartOfFrame && offset + 7 <= buffer.length) {
        return {
          height: buffer.readUInt16BE(offset + 3),
          width: buffer.readUInt16BE(offset + 5),
        };
      }

      offset += length;
    }
  }

  return { width: 0, height: 0 };
}

export async function validateImage(buffer: Buffer, type: ImageType) {
  const { width, height } = getImageDimensions(buffer);
  const ratio = height > 0 ? width / height : 0;
  const expected = type === "POSTER" ? 2 / 3 : 16 / 9;
  const valid = width > 0 && height > 0 && Math.abs(ratio - expected) <= 0.05;

  return {
    valid,
    width,
    height,
    message: valid
      ? "Valid image."
      : `Expected ${type === "POSTER" ? "2:3" : "16:9"} aspect ratio.`,
  };
}
