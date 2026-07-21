"use client";

import { useRouter } from "next/navigation";
import MovieForm from "@/components/admin/movies/movieForm";
import type { MovieFormData } from "@/types/movie";
import { useState } from "react";

export default function CreateMoviePage() {
  const router = useRouter();
  const [apiError, setApiError] = useState("");

  async function handleSubmit(data: MovieFormData) {
    try {
      setApiError("");
      const formData = new FormData();

      formData.append("title", data.title);
      formData.append("description", data.description);
      formData.append("genre", data.genre);
      formData.append("releaseYear", String(data.releaseYear));

      if (data.video) {
        formData.append("video", data.video);
      }

      if (data.thumbnail) {
        formData.append("thumbnail", data.thumbnail);
      }

      const res = await fetch("/api/movies", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();

      if (!res.ok) {
        console.log("API ERROR:", result);

        alert(result.message || "Movie create failed");

        setApiError(result.message || "Movie create failed");

        return;
      }

      setApiError("");

      alert(result.message);

      router.push("/admin/movies");
      router.refresh();
    } catch (error) {
      console.error("Unexpected error:", error);
      setApiError("Something went wrong. Please try again.");
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">
        Create Movie
      </h1>
      <MovieForm
        onSubmit={handleSubmit}
        apiError={apiError}
      />
    </div>
  );
}