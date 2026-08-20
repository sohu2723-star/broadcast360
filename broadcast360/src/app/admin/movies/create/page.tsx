"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import MovieForm from "@/components/admin/movies/movieForm";
import type { MovieFormData } from "@/types/movie";

function getResponseMessage(response: Response, body: string) {
  const contentType = response.headers.get("content-type") || "";
  let parsed: { message?: string; error?: string } = {};

  if (contentType.includes("application/json") && body.trim()) {
    try {
      parsed = JSON.parse(body) as typeof parsed;
    } catch {
      parsed = {};
    }
  }

  if (parsed.message || parsed.error) {
    return parsed.message || parsed.error || "Movie creation failed";
  }

  if (response.redirected || response.url.includes("/login") || response.status === 401 || response.status === 403) {
    return "Admin session expired or access was denied. Please log in again and retry.";
  }

  if (!contentType.includes("application/json")) {
    return `Server returned an unexpected response (HTTP ${response.status}). Please refresh and try again.`;
  }

  return `Movie creation failed (HTTP ${response.status}). Please try again.`;
}

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

      if (data.video) formData.append("video", data.video);
      if (data.thumbnail) formData.append("thumbnail", data.thumbnail);

      const response = await fetch("/api/movies", {
        method: "POST",
        body: formData,
        redirect: "follow",
      });
      const body = await response.text();

      if (!response.ok) {
        const message = getResponseMessage(response, body);
        console.error("Movie API error:", response.status, body.slice(0, 500));
        setApiError(message);
        return;
      }

      let result: { message?: string } = {};
      try {
        result = body ? (JSON.parse(body) as typeof result) : {};
      } catch {
        setApiError("Movie was not confirmed by the server. Please refresh and check the Movies list.");
        return;
      }

      setApiError("");
      alert(result.message || "Movie created successfully");
      router.push("/admin/movies");
      router.refresh();
    } catch (error) {
      console.error("Unexpected Movie Create error:", error);
      setApiError(
        error instanceof Error
          ? error.message
          : "Unable to reach the server. Check your connection and try again.",
      );
    }
  }

  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold text-white">Create Movie</h1>
      <MovieForm
        onSubmit={handleSubmit}
        apiError={apiError}
        onApiErrorClear={() => setApiError("")}
      />
    </div>
  );
}
