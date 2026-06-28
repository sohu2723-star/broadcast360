"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { MovieFormData } from "@/types/movie";
import {
  createMovieSchema,
  editMovieSchema,
} from "@/lib/validators/movie.validator";

type Props = {
  initialData?: MovieFormData;
  movieId?: number;
  onSubmit: (data: MovieFormData) => Promise<void>;
};

export default function MovieForm({
  initialData,
  movieId,
  onSubmit,
}: Props) {
  const router = useRouter();

  const [form, setForm] = useState<MovieFormData>(
    initialData ?? {
      title: "",
      description: "",
      video: null,
      releaseYear: new Date().getFullYear(),
    }
  );

  const [errors, setErrors] = useState<
    Record<string, string>
  >({});

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    const schema = movieId
      ? editMovieSchema
      : createMovieSchema;

    const result = schema.safeParse(form);

    if (!result.success) {
      const fieldErrors: Record<
        string,
        string
      > = {};

      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as string;

        if (field) {
          fieldErrors[field] = issue.message;
        }
      });

      setErrors(fieldErrors);
      return;
    }

    setErrors({});

    await onSubmit(form);
  }

  return (
    <div className="bg-[#0B1026] border border-white/10 rounded-2xl p-8 max-w-3xl">
      <form
        className="space-y-5"
        onSubmit={handleSubmit}
      >
        {/* Title */}
        <div>
          <label className="block mb-2">
            Movie Title
          </label>

          <input
            className="
              w-full
              bg-[#111936]
              border
              border-white/10
              rounded-xl
              p-3
            "
            value={form.title}
            onChange={(e) =>
              setForm({
                ...form,
                title: e.target.value,
              })
            }
          />

          {errors.title && (
            <p className="text-red-500 text-sm mt-1">
              {errors.title}
            </p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block mb-2">
            Description
          </label>

          <textarea
            rows={4}
            className="
              w-full
              bg-[#111936]
              border
              border-white/10
              rounded-xl
              p-3
            "
            value={form.description}
            onChange={(e) =>
              setForm({
                ...form,
                description: e.target.value,
              })
            }
          />

          {errors.description && (
            <p className="text-red-500 text-sm mt-1">
              {errors.description}
            </p>
          )}
        </div>

        {/* Video */}
        <div>
          <label className="block mb-2">
            Movie File
          </label>

          <input
            type="file"
            accept="video/*"
            className="
              w-full
              bg-[#111936]
              border
              border-white/10
              rounded-xl
              p-3
            "
            onChange={(e) =>
              setForm({
                ...form,
                video:
                  e.target.files?.[0] ?? null,
              })
            }
          />

          {errors.video && (
            <p className="text-red-500 text-sm mt-1">
              {errors.video}
            </p>
          )}
        </div>

        {/* Release Year */}
        <div>
          <label className="block mb-2">
            Release Year
          </label>

          <input
            type="number"
            min={1900}
            max={new Date().getFullYear()}
            placeholder="YYYY"
            className="
              w-full
              bg-[#111936]
              border
              border-white/10
              rounded-xl
              p-3
            "
            value={form.releaseYear}
            onChange={(e) =>
              setForm({
                ...form,
                releaseYear: Number(
                  e.target.value
                ),
              })
            }
          />

          {errors.releaseYear && (
            <p className="text-red-500 text-sm mt-1">
              {errors.releaseYear}
            </p>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            className="
              flex-1
              bg-[#106EE9]
              py-3
              rounded-xl
              font-bold
              hover:opacity-80
            "
          >
            Save Movie
          </button>

          <button
            type="button"
            onClick={() =>
              router.push("/admin/movies")
            }
            className="
              bg-[#F41010]
              px-6
              py-3
              rounded-xl
              font-bold
              hover:opacity-80
            "
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}