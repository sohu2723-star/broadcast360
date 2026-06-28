"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";

import MovieForm from "@/components/admin/movies/movieForm";
import type { MovieFormData } from "@/types/movie";

type Movie = {
  id: number;
  title: string;
  description: string | null;
  videoUrl: string;
  thumbnail: string | null;
  duration: number | null;
  releaseYear: number | null;
};

export default function EditMoviePage() {
  const params = useParams();

  const id = Number(params.id); 

  const [movie, setMovie] = useState<Movie | null>(null);

  useEffect(() => {
    async function loadMovie() {
      try {
        const res = await fetch(`/api/movies/${id}`);

        if (!res.ok) {
          throw new Error("Movie not found");
        }

        const data: Movie = await res.json();
        setMovie(data);
      } catch (err) {
        console.log(err);
      }
    }

    if (id) {
      loadMovie();
    }
  }, [id]);

  if (!movie) return <p>Loading...</p>;

  const initialData: MovieFormData = {
    title: movie.title,
    description: movie.description ?? "",
    releaseYear:
      movie.releaseYear ?? new Date().getFullYear(), 
    video: null, 
  };

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-5">
        Edit Movie
      </h1>

      {/* Video Preview */}
      <div>
        <h2 className="font-semibold">Video</h2>

        <video
          width="600"
          controls
          className="rounded"
        >
          <source src={movie.videoUrl} type="video/mp4" />
        </video>
      </div>

      {/* Thumbnail Preview */}
      <div className="mt-5">
        <h2 className="font-semibold">Thumbnail</h2>

        {movie.thumbnail && (
          <Image
            src={movie.thumbnail}
            width={250}
            height={150}
            className="rounded"
            alt="thumbnail"
          />
        )}
      </div>

      {/* Duration */}
      <div className="mt-5">
        <p>
          Duration:{" "}
          {movie.duration
            ? `${movie.duration} seconds`
            : "No duration"}
        </p>
      </div>

      {/* Edit Form */}
      <div className="mt-8">
        <MovieForm
          initialData={initialData}
          movieId={movie.id}
          onSubmit={async (data) => {
            await fetch(`/api/movies/${movie.id}`, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(data),
            });
          }}
        />
      </div>
    </div>
  );
}