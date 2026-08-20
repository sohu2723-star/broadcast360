"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Film } from "lucide-react";

type Movie = {
  id: number;
  title: string;
  description: string | null;
  genre: string | null;
  thumbnail: string | null;
  videoUrl: string | null;
  duration: number;
  releaseYear: number | null;
  createdAt: string;
};

const formatDuration = (sec: number) => {
  if (!sec || sec < 0) {
    return "00:00:00";
  }

  const hours = Math.floor(sec / 3600);
  const minutes = Math.floor((sec % 3600) / 60);
  const seconds = Math.floor(sec % 60);

  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
};

export default function MovieDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getMovie() {
      try {
        const { id } = await params;

        const res = await fetch(`/api/movies/${id}`);

        if (!res.ok) {
          throw new Error("Movie not found");
        }

        const data = await res.json();

        setMovie(data);
      } catch (error) {
        console.error(error);
        setMovie(null);
      } finally {
        setLoading(false);
      }
    }

    getMovie();
  }, [params]);

  if (loading) {
    return <div className="p-8 text-white">Loading...</div>;
  }

  if (!movie) {
    return (
      <div className="p-8 text-white">
        <p className="mb-4 text-red-500">Movie not found</p>

        <Link
          href="/admin/movies"
          className="inline-flex items-center gap-2 rounded-lg bg-[#4f6689] px-4 py-2 text-sm"
        >
          <ArrowLeft size={18} />
          Back to Movies
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8 text-white">
      {/* Back Button */}
      <Link
        href="/admin/movies"
        className="mb-6 inline-flex items-center gap-2 rounded-lg border border-white/10 bg-[#131B2E] px-4 py-2 text-sm transition hover:bg-[#1E293B]"
      >
        <ArrowLeft size={18} />
        Back
      </Link>

      <div className="max-w-5xl space-y-6">
        {/* Thumbnail + Video */}
        <div className="grid grid-cols-1 gap-6 rounded-2xl border border-white/10 bg-[#0B1026] p-6 md:grid-cols-3">
          {/* Thumbnail */}
          <div>
            <p className="mb-3 text-sm text-gray-400">Thumbnail</p>

            <div className="h-[360px] w-[240px] overflow-hidden rounded-xl bg-[#151C35]">
              {movie.thumbnail ? (
                <Image
                  src={movie.thumbnail}
                  alt={movie.title}
                  width={240}
                  height={360}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-[#7898bf]">
                  <Film size={54} strokeWidth={1.4} aria-hidden="true" />
                </div>
              )}
            </div>
          </div>

          {/* Video */}
          <div className="md:col-span-2">
            <p className="mb-3 text-sm text-gray-400">Video Preview</p>

            {movie.videoUrl ? (
              <video
                controls
                className="h-[360px] w-full rounded-xl border border-white/10 bg-black object-contain"
              >
                <source src={movie.videoUrl} type="video/mp4" />
                Your browser does not support video.
              </video>
            ) : (
              <div className="flex h-[360px] items-center justify-center rounded-xl bg-[#151C35] text-gray-400">
                No video available
              </div>
            )}
          </div>
        </div>

        {/* Movie Information */}
        <div className="rounded-2xl border border-white/10 bg-[#0B1026] p-6">
          <h1 className="mb-6 text-2xl font-bold">Movie Information</h1>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <p className="text-sm text-gray-400">Title</p>

              <div className="mt-2 rounded-lg bg-[#151C35] px-4 py-3">
                {movie.title}
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-400">Genre</p>

              <div className="mt-2 rounded-lg bg-[#151C35] px-4 py-3">
                {movie.genre || "-"}
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-400">Movie ID</p>

              <div className="mt-2 rounded-lg bg-[#151C35] px-4 py-3">
                {movie.id}
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-400">Duration</p>

              <div className="mt-2 rounded-lg bg-[#151C35] px-4 py-3">
                {formatDuration(movie.duration)}
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-400">Release Year</p>

              <div className="mt-2 rounded-lg bg-[#151C35] px-4 py-3">
                {movie.releaseYear || "-"}
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-400">Created Date</p>

              <div className="mt-2 rounded-lg bg-[#151C35] px-4 py-3">
                {new Date(movie.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mt-6">
            <p className="text-sm text-gray-400">Description</p>

            <div className="mt-2 min-h-[120px] rounded-lg bg-[#151C35] px-4 py-4 leading-7 text-gray-300">
              {movie.description || "No description available."}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
