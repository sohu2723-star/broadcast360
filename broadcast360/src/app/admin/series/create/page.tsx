"use client";

import { useRouter } from "next/navigation";
import SeriesForm from "@/components/admin/series/serieForm";
import type { SeriesFormData } from "@/types/serie";

import { createSeriesSchema } from "@/lib/validators/serie.validator";

export default function CreateSeriesPage() {
  const router = useRouter();

  async function handleSubmit(data: SeriesFormData) {
    try {
      // ✅ SAFE NORMALIZATION
      const payload = {
        title: data.title,
        description: data.description,
        genre: data.genre || "",
        releaseYear:
          typeof data.releaseYear === "number"
            ? data.releaseYear
            : Number(data.releaseYear),
        thumbnail: data.thumbnail ?? null,
      };

      // ✅ VALIDATE
      const result = createSeriesSchema.safeParse(payload);

      if (!result.success) {
        console.log(result.error.flatten().fieldErrors);
        alert(result.error.issues[0].message);
        return;
      }

      // ✅ BUILD FORMDATA
      const formData = new FormData();

      formData.append("title", result.data.title);
      formData.append("description", result.data.description);
      formData.append("genre", result.data.genre);
      formData.append("releaseYear", String(result.data.releaseYear));

      if (result.data.thumbnail instanceof File) {
        formData.append("thumbnail", result.data.thumbnail);
      }

      // ✅ API CALL
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
      <h1 className="text-3xl font-bold text-white mb-8">
        Create Series
      </h1>

      <SeriesForm onSubmit={handleSubmit} />
    </div>
  );
}