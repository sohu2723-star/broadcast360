"use client";

import { useRouter } from "next/navigation";
import MovieForm from "@/components/admin/movies/movieForm";
import type { MovieFormData } from "@/types/movie";

export default function CreateMoviePage() {
  const router = useRouter();

  async function handleSubmit(data: MovieFormData) {
    try {
      const formData = new FormData();

      formData.append("title", data.title);
      formData.append("description", data.description);

     
      const releaseYear =
        typeof data.releaseYear === "number"
          ? data.releaseYear
          : Number(data.releaseYear);

      formData.append("releaseYear", String(releaseYear));

      if (data.video) {
        formData.append("video", data.video);
      }

      const res = await fetch("/api/movies", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        console.error("Create movie failed:", err);
        return;
      }

      router.push("/admin/movies");
      router.refresh();
    } catch (error) {
      console.error("Unexpected error:", error);
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">
        Create Movie
      </h1>

      <MovieForm onSubmit={handleSubmit} />
    </div>
  );
}