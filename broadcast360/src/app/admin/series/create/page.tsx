"use client";

import { useRouter } from "next/navigation";
import SeriesForm from "@/components/admin/series/serieForm";
import type { SeriesFormData } from "@/types/serie";
import { useState } from "react";
import { createSeriesSchema } from "@/lib/validators/serie.validator";

export default function CreateSeriesPage() {
  const router = useRouter();
  const [errors, setErrors] = useState<{ api?: string }>({});

  async function handleSubmit(data: SeriesFormData) {
    try {
      //  SAFE NORMALIZATION
      const releaseYear =
        typeof data.releaseYear === "string"
          ? Number(data.releaseYear)
          : data.releaseYear;

      const payload = {
        title: data.title,
        description: data.description,
        genre: data.genre || "",
        releaseYear,
        thumbnail: data.thumbnail ?? null,
      };

      // VALIDATE
      const result = createSeriesSchema.safeParse(payload);

      if (!result.success) {
        console.log(result.error.flatten().fieldErrors);
        setErrors({ api: result.error.issues[0].message });
        return;
      }
      const year = result.data.releaseYear;
      const currentYear = new Date().getFullYear();

      if (!Number.isInteger(year) || year < 1900 || year > currentYear) {
        setErrors({ api: "Invalid release year format" });
        return;
      }

      //  BUILD FORMDATA
      const formData = new FormData();

      formData.append("title", result.data.title);
      formData.append("description", result.data.description);
      formData.append("genre", result.data.genre);
      formData.append("releaseYear", String(result.data.releaseYear));

      if (result.data.thumbnail instanceof File) {
        formData.append("thumbnail", result.data.thumbnail);
      }

      // API CALL
      const res = await fetch("/api/series", {
        method: "POST",
        body: formData,
      });

      const response = await res.json();

      if (!res.ok) {
        alert(response.message || "Failed to create series");
        return;
      }

      alert("Series created successfully!");

      router.push("/admin/series");
      router.refresh();
    } catch (error) {
      console.error("Create Series Error:", error);
      alert("Something went wrong.");
    }
  }

  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold text-white">Create Series</h1>

      {/* ADD THIS HERE */}
      {errors.api && (
        <div className="mb-4 rounded bg-red-900/20 p-3 text-red-400">
          {errors.api}
        </div>
      )}

      <SeriesForm onSubmit={handleSubmit} />
    </div>
  );
}
