import { NextRequest, NextResponse } from "next/server";

import {
  fetchMovies,
  addMovie,
} from "@/services/movie.service";

export async function GET() {
  try {
    const movies = await fetchMovies();

    return NextResponse.json(movies);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Failed to fetch movies" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest
) {
  try {
    const formData = await req.formData();

    const movie = await addMovie(formData);

    return NextResponse.json(movie);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Create error" },
      { status: 500 }
    );
  }
}