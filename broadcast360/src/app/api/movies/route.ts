import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { fetchPaginatedMovies, addMovie } from "@/services/movie.service";

/* -------------------------
   ZOD VALIDATION
--------------------------*/
const movieSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  releaseYear: z.number().optional(),
});

/* -------------------------
   GET MOVIES (pagination + search)
--------------------------*/
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const page = Math.max(
      1,
      parseInt(searchParams.get("page") ?? "1", 10) || 1
    );

    const limit = Math.max(
      1,
      parseInt(searchParams.get("limit") ?? "10", 10) || 10
    );

    const search = searchParams.get("search") ?? undefined;

    const result = await fetchPaginatedMovies(page, limit, search);

    return NextResponse.json(result);
  } catch (error) {
    console.error("GET ERROR =", error);

    return NextResponse.json(
      { message: "Failed to fetch movies" },
      { status: 500 }
    );
  }
}

/* -------------------------
   CREATE MOVIE
--------------------------*/
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const rawData = {
      title: formData.get("title"),
      description: formData.get("description"),
      genre: formData.get("genre"),
      releaseYear: Number(formData.get("releaseYear")),
    };

    const result = movieSchema.safeParse(rawData);

    if (!result.success) {
      return NextResponse.json(
        {
          message: "Validation failed",
          errors: result.error.flatten(),
        },
        { status: 400 }
      );
    }

    const video = formData.get("video") as File | null;

    if (!video) {
      return NextResponse.json(
        { message: "Video file is required" },
        { status: 400 }
      );
    }

    const movie = await addMovie(formData);

    return NextResponse.json(movie);
  } catch (error) {
    console.error("POST ERROR =", error);

    return NextResponse.json(
      { message: "Create error" },
      { status: 500 }
    );
  }
}