"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import MovieForm from "@/components/admin/movies/movieForm";
import type { MovieFormData } from "@/types/movie";
import { uploadAdminFileDirect } from "@/lib/media/direct-upload";

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

  if (
    response.redirected ||
    response.url.includes("/login") ||
    response.status === 401 ||
    response.status === 403
  ) {
    return "Admin session expired or access was denied. Please log in again and retry.";
  }

  if (!contentType.includes("application/json")) {
    return `Server returned an unexpected response (HTTP ${response.status}). Please refresh and try again.`;
  }

  return `Movie creation failed (HTTP ${response.status}). Please try again.`;
}

function getVideoDuration(file: File) {
  return new Promise<number>((resolve) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      const duration = Number.isFinite(video.duration) ? video.duration : 0;
      URL.revokeObjectURL(url);
      resolve(Math.max(0, Math.round(duration)));
    };
    video.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(0);
    };
    video.src = url;
  });
}

export default function CreateMoviePage() {
  const router = useRouter();
  const [apiError, setApiError] = useState("");

  async function handleSubmit(data: MovieFormData) {
    try {
      setApiError("");

      if (!data.video) {
        setApiError("Video file is required");
        return;
      }
      if (!data.thumbnail) {
        setApiError("Movie poster is required");
        return;
      }

      const [videoUpload, thumbnailUpload, duration] = await Promise.all([
        uploadAdminFileDirect(data.video, "videos/movies"),
        uploadAdminFileDirect(data.thumbnail, "thumbnails/movies"),
        getVideoDuration(data.video),
      ]);

      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("description", data.description);
      formData.append("genre", data.genre);
      formData.append("releaseYear", String(data.releaseYear));
      formData.append("accessType", data.accessType ?? "FREE");
      formData.append("videoUrl", videoUpload.publicUrl);
      formData.append("thumbnailUrl", thumbnailUpload.publicUrl);
      formData.append("duration", String(duration));

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
          : "Unable to upload or create the movie. Please try again.",
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
