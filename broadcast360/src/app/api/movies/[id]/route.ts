import { NextRequest, NextResponse } from "next/server";
import {
  fetchMovieById,
  removeMovie,
  editMovie,
} from "@/services/movie.service";

// GET MOVIE BY ID
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const movieId = Number(id);

    if (isNaN(movieId)) {
      return NextResponse.json(
        { message: "Invalid ID" },
        { status: 400 }
      );
    }

    const movie = await fetchMovieById(movieId);

    if (!movie) {
      return NextResponse.json(
        { message: "Movie not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(movie);
  } catch (error) {
    console.error("Database operation failed: to get movie by id", error);
    return NextResponse.json(
      { message: "Failed to get movie by id" },
      { status: 500 }
    );
  }
}

// UPDATE MOVIE
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const movieId = Number(id);

    if (isNaN(movieId)) {
      return NextResponse.json(
        { message: "Invalid ID" },
        { status: 400 }
      );
    }

    const formData = await req.formData();

    const updatedMovie = await editMovie(formData, movieId);

    return NextResponse.json(updatedMovie);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Update failed" },
      { status: 500 }
    );
  }
}
// DELETE MOVIE
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const movieId = Number(id);

    if (isNaN(movieId)) {
      return NextResponse.json(
        { message: "Invalid ID" },
        { status: 400 }
      );
    }

    // Verify movie exists before attempting deletion (from origin/main)
    const movie = await fetchMovieById(movieId);
    if (!movie) {
      return NextResponse.json(
        { message: "Movie not found" },
        { status: 404 }
      );
    }

    await removeMovie(movieId);

    return NextResponse.json({
      message: "Movie deleted successfully",
    });
  } catch (error) {
    console.error("Database operation failed: to delete movie", error);
    return NextResponse.json(
      { message: "Failed to delete movie" },
      { status: 500 }
    );
  }
}