"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import SeriesForm from "@/components/admin/series/serieForm";
import type { SeriesFormData } from "@/types/serie";

import { editSeriesSchema } from "@/lib/validators/serie.validator";

type Series = {
  id: number;
  title: string;
  description: string | null;
  genre: string | null;
  releaseYear: number | null;
  thumbnail: string | null;
};

export default function EditSeriesPage() {
  const params = useParams();
  const router = useRouter();

  const id = params?.id ? String(params.id) : "";

  const [series, setSeries] = useState<Series | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    async function loadSeries() {
      try {
        const res = await fetch(`/api/series/${id}`);

        const data = await res.json();

        console.log(data);

        if (!res.ok) throw new Error("Series not found");

        // const data: Series = await res.json();
        setSeries(data.data);
      } catch (err) {
        console.error(err);
        setSeries(null);
      } finally {
        setLoading(false);
      }
    }

    loadSeries();
  }, [id]);

  if (loading) {
    return <p className="text-white">Loading...</p>;
  }

  if (!series) {
    return <p className="text-red-500">Series not found</p>;
  }

  // ✅ IMPORTANT: fill all fields
  const initialData: SeriesFormData = {
    title: series.title,
    description: series.description ?? "",
    genre: series.genre ?? "",
    releaseYear: series.releaseYear ?? new Date().getFullYear(),
    thumbnail: null,
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-5 text-white">
        Edit Series
      </h1>

      <SeriesForm
        initialData={initialData}
        seriesId={series.id}
        thumbnailUrl={series.thumbnail}
        onSubmit={async (data) => {
          try {
            // ✅ validate (edit schema = thumbnail optional)
            const result = editSeriesSchema.safeParse({
              title: data.title,
              description: data.description,
              genre: data.genre,
              releaseYear: data.releaseYear,
              thumbnail: data.thumbnail ?? undefined,
            });

            if (!result.success) {
              const errors = result.error.flatten().fieldErrors;
              console.log(errors);

              alert(result.error.issues[0].message);
              return;
            }

            const formData = new FormData();

            formData.append("title", data.title);
            formData.append("description", data.description);
            formData.append("genre", data.genre);
            formData.append(
              "releaseYear",
              String(data.releaseYear)
            );

            if (data.thumbnail instanceof File) {
              formData.append("thumbnail", data.thumbnail);
            }

            const res = await fetch(`/api/series/${series.id}`, {
              method: "PUT",
              body: formData,
            });

            if (!res.ok) {
              const error = await res.json();
              alert(error.message || "Update failed");
              return;
            }

            alert("Series updated successfully!");

            router.push("/admin/series");
            router.refresh();
          } catch (error) {
            console.error("Unexpected error:", error);
            alert("Something went wrong");
          }
        }}
      />
    </div>
  );
}
