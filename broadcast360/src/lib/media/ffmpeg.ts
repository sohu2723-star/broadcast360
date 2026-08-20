/**
 * Cloudflare Workers-safe media metadata helpers.
 *
 * The previous implementation imported fluent-ffmpeg and the ffprobe binary.
 * Those native/binary dependencies cannot run inside a Worker and made the
 * default handler exceed Cloudflare's 3 MiB free-plan size limit. Production
 * uploads therefore use the client-side duration plus a client-provided
 * thumbnail (the signed R2 upload path already supplies both).
 */

type VideoInfo = {
  duration: number;
  thumbnail: string;
};

export async function getVideoInfo(_filePath: string): Promise<VideoInfo> {
  return {
    duration: 0,
    thumbnail: "",
  };
}

export async function getVideoDuration(_filePath: string): Promise<number> {
  return 0;
}

export async function generateThumbnail(
  _videoPath: string,
  _outputPath: string,
): Promise<string> {
  throw new Error(
    "Server-side thumbnail generation is unavailable on Cloudflare Workers. Upload a thumbnail with the video.",
  );
}

export async function startFFmpegStream(
  _videos: string[],
  _streamKey: string,
): Promise<never> {
  throw new Error(
    "Server-side FFmpeg streaming is unavailable on Cloudflare Workers. Use the configured streaming service.",
  );
}
