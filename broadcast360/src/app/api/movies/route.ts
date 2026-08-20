import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { fetchPaginatedMovies, addMovie } from "@/services/movie.service";

/* -------------------------
   ZOD VALIDATION
--------------------------*/
const movieSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().trim().min(1, "Description is required"),
  genre: z.string().trim().min(1, "Genre is required"),
  releaseYear: z.number().int().min(1900, "Release year is invalid").max(new Date().getFullYear(), "Release year cannot be in the future"),
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

    const video = formData.get("video");
    const thumbnail = formData.get("thumbnail");

    if (!(video instanceof File) || video.size <= 0) {
      return NextResponse.json(
        { message: "Video file is required" },
        { status: 400 }
      );
    }

    if (!(thumbnail instanceof File) || thumbnail.size <= 0) {
      return NextResponse.json(
        { message: "Thumbnail file is required" },
        { status: 400 },
      );
    }

    const movie = await addMovie(formData);

    return NextResponse.json(
      {
        message: "Movie created successfully",
        data: movie,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST ERROR =", error);

    if (error.code === "P2002") {
      return NextResponse.json(
        { message: "Movie already exists for this title and year" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Movie create failed",
      },
      { status: 500 }
    );
  }
}