import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { fetchMovies, addMovie } from "@/services/movie.service";

/* -------------------------
   ZOD VALIDATION (SERVER)
--------------------------*/
const movieSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  releaseYear: z.number().optional(),
});

export async function GET() {
  try {
    const movies = await fetchMovies();
    return NextResponse.json(movies);
  } catch (error) {
    console.error("GET ERROR =", error);

    return NextResponse.json(
      { message: "Failed to fetch movies" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    // extract data
    const rawData = {
      title: formData.get("title"),
      description: formData.get("description"),
      releaseYear: Number(formData.get("releaseYear")),
    };

    // validate (Zod)
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

    // ensure video exists
    const video = formData.get("video") as File | null;

    if (!video) {
      return NextResponse.json(
        { message: "Video file is required" },
        { status: 400 }
      );
    }

    //  call service (NO extra logs needed)
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