"use client";

import { useEffect, useState } from "react";
import  Image  from "next/image";

type Movie = {
  id: number;
  title: string;
  description: string | null;
  thumbnail: string | null;
  videoUrl: string | null;
  duration: number;
  releaseYear: number | null;
  createdAt: string;
};

export default function MovieDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [movie, setMovie] = useState<Movie | null>(null);

  useEffect(() => {
    async function getMovie() {
      const { id } = await params;

      const res = await fetch(`/api/movies/${id}`);
      const data = await res.json();

      setMovie(data);
    }

    getMovie();
  }, [params]);

  if (!movie) {
    return <div className="text-white">Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">
        Movie Details
      </h1>

      <div className="bg-[#0B1026] rounded-2xl p-8 border border-white/10 max-w-4xl">
        {/* Thumbnail */}
        <div className="flex items-center gap-5 mb-8">
          {movie.thumbnail ? (
            <Image
              src={movie.thumbnail}
              alt={movie.title}
              width={96}
              height={96}
              className="w-24 h-24 rounded-lg object-cover"
            />
          ) : (
            <div className="w-24 h-24 rounded-lg bg-[#106EE9] flex items-center justify-center text-4xl">
              🎬
            </div>
          )}

          <div>
            <h2 className="text-2xl font-bold">
              {movie.title}
            </h2>

            <p className="text-gray-400">
              {movie.releaseYear ?? "Unknown Year"}
            </p>
          </div>
        </div>

        {/* Video Preview */}
        {movie.videoUrl && (
          <div className="mb-8">
            <p className="text-gray-400 mb-3">
              Video Preview
            </p>

            <video
              controls
              className="w-full rounded-lg border border-white/10"
            >
              <source
                src={movie.videoUrl}
                type="video/mp4"
              />
              Your browser does not support video playback.
            </video>
          </div>
        )}

        {/* Movie Information */}
        <div className="space-y-4">
          <div>
            <p className="text-gray-400">
              Description
            </p>

            <p>
              {movie.description ??
                "No description available"}
            </p>
          </div>

          <div>
            <p className="text-gray-400">
              Movie ID
            </p>

            <p>{movie.id}</p>
          </div>

          <div>
            <p className="text-gray-400">
              Duration
            </p>

            <p>{movie.duration} minutes</p>
          </div>

          <div>
            <p className="text-gray-400">
              Release Year
            </p>

            <p>{movie.releaseYear ?? "-"}</p>
          </div>

          <div>
            <p className="text-gray-400">
              Created
            </p>

            <p>
              {new Date(
                movie.createdAt
              ).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}