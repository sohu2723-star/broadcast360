"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import MovieForm from "@/components/admin/movies/movieForm";
import type { Movie, MovieFormData } from "@/types/movie";

export default function EditMoviePage() {
  const params = useParams();
  const router = useRouter();

  const id = Number(params.id);

  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    async function loadMovie() {
      try {
        const res = await fetch(`/api/movies/${id}`);
        const data: Movie = await res.json();
        setMovie(data);
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
    accessType: movie.accessType ?? "FREE",
    video: null,
    thumbnail: null,
  };

  return (
    <div className="space-y-6 p-6 text-white">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Edit Movie</h1>

        <button
          onClick={() => router.push("/admin/movies")}
          className="cursor-pointer rounded-xl bg-white/10 px-4 py-2 text-sm font-medium transition hover:bg-white/20"
        >
          Back
        </button>
      </div>

      {/* SINGLE CONTAINER FORM (MATCHING ENTERTAINMENT EDIT UI) */}
      <MovieForm
        initialData={initialData}
        movieId={movie.id}
        initialVideoUrl={movie.videoUrl}
        initialThumbnailUrl={movie.thumbnail}
        showPreview={false}
        apiError={apiError}
        onSubmit={async (form) => {
          setApiError("");
          const formData = new FormData();

          formData.append("title", form.title);
          formData.append("description", form.description);
          formData.append("genre", form.genre);
          formData.append("releaseYear", String(form.releaseYear));
          formData.append("accessType", form.accessType ?? "FREE");

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
              error instanceof Error ? error.message : "Update failed",
            );
          }
        }}
      />
    </div>
  );
}
