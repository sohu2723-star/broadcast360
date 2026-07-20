"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";

import MovieForm from "@/components/admin/movies/movieForm";
import type { Movie, MovieFormData } from "@/types/movie";

export default function EditMoviePage() {
  const params = useParams();
  const router = useRouter();

  const id = Number(params.id);

 const [movie, setMovie] = useState<Movie | null>(null);
const [loading, setLoading] = useState(true);
const [apiError, setApiError] = useState("");

const [previewVideo, setPreviewVideo] = useState<string | null>(null);
const [previewThumbnail, setPreviewThumbnail] = useState<string | null>(null);
const [selectedVideoPreview, setSelectedVideoPreview] =
  useState<string | null>(null);

const [selectedThumbnailPreview, setSelectedThumbnailPreview] =
  useState<string | null>(null);

  useEffect(() => {
    async function loadMovie() {
      try {
        const res = await fetch(`/api/movies/${id}`);
        const data: Movie = await res.json();
        setMovie(data);
        setPreviewVideo(data.videoUrl);
setPreviewThumbnail(data.thumbnail);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    }

    if (id) loadMovie();
  }, [id]);

  if (loading) return <p className="p-10 text-gray-400">Loading...</p>;
  if (!movie) return <p className="p-10 text-red-400">Movie not found</p>;

  const initialData: MovieFormData = {
    title: movie.title,
    description: movie.description ?? "",
    genre: movie.genre ?? "",
    releaseYear: movie.releaseYear ?? new Date().getFullYear(),
    video: null,
    thumbnail: null, // IMPORTANT ADD
  };

  return (
    <div className="p-6 text-white space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Edit Movie</h1>

        <button
          onClick={() => router.push("/admin/movies")}
          className="px-4 py-2 bg-white/10 rounded-lg"
        >
          Back
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* LEFT SIDE - PREVIEW */}
        <div className="space-y-6">

          {/* VIDEO PLAYER */}
          <div className="bg-[#0B1026] p-4 rounded-xl border border-white/10">
            <p className="text-gray-400 mb-2">Video Preview</p>

            <video
  key={selectedVideoPreview ?? previewVideo}
  controls
  className="w-full rounded-lg border border-white/10"
>
  <source
    src={selectedVideoPreview ?? previewVideo ?? ""}
    type="video/mp4"
  />
</video>
          </div>

          {/* THUMBNAIL PREVIEW */}
          <div className="bg-[#0B1026] p-4 rounded-xl border border-white/10">
            <p className="text-gray-400 mb-2">Thumbnail Preview</p>

{selectedThumbnailPreview ?? previewThumbnail ? (
              <div className="relative w-full h-[200px] rounded-lg overflow-hidden">
               <Image
  key={
    selectedThumbnailPreview ??
    previewThumbnail
  }
  src={
    selectedThumbnailPreview ??
    previewThumbnail ??
    ""
  }
  alt="thumbnail"
  fill
  className="object-cover"
/>
              </div>
            ) : (
              <p className="text-gray-500">No thumbnail</p>
            )}
          </div>

        </div>

        {/* RIGHT SIDE - FORM */}
       <MovieForm
  initialData={initialData}
  movieId={movie.id}
  showPreview={false}
  apiError={apiError}
  onPreviewChange={(video, thumbnail) => {
  setSelectedVideoPreview(video);
  setSelectedThumbnailPreview(thumbnail);
}}
  onSubmit={async (form) => {
    const formData = new FormData();

    formData.append("title", form.title);
    formData.append("description", form.description);
    formData.append("genre", form.genre);
    formData.append("releaseYear", String(form.releaseYear));

    if (form.video) {
      formData.append("video", form.video);
    }

    if (form.thumbnail) {
      formData.append("thumbnail", form.thumbnail);
    }
            try {
              const res = await fetch(`/api/movies/${movie.id}`, {
                method: "PUT",
                body: formData,
              });


              const result = await res.json();

              if (!res.ok) {
                setApiError(result.message || "Update failed");
                return;
              }

              alert(result.message);

              router.push("/admin/movies");
              router.refresh();
            } catch (error) {
              setApiError(
                error instanceof Error
                  ? error.message
                  : "Update failed"
              );
            }
          }}
        />
      </div>
    </div>
  );
}