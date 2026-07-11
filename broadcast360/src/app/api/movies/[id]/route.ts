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

   const oldMovie = await fetchMovieById(movieId);

if (!oldMovie) {
  return NextResponse.json(
    { message: "Movie not found" },
    { status: 404 }
  );
}

const formData = await req.formData();

const title = formData.get("title");
const description = formData.get("description");
const genre = formData.get("genre");
const releaseYear = Number(formData.get("releaseYear"));

const video = formData.get("video");
const thumbnail = formData.get("thumbnail");


const noChanges =
  oldMovie.title === title &&
  oldMovie.description === description &&
  oldMovie.genre === genre &&
  oldMovie.releaseYear === releaseYear &&
  !video &&
  !thumbnail;


if (noChanges) {
  return NextResponse.json(
    {
      message: "No changes, movie update successfully",
    },
    { status: 200 }
  );
}


const updatedMovie = await editMovie(formData, movieId);

return NextResponse.json(
  {
    message: "Movie updated successfully",
    data: updatedMovie,
  },
  { status: 200 }
);
  } catch (error: any) {
    console.error(error);

    if (error.code === "P2002") {
      return NextResponse.json(
        {
          message: "Movie already exists for this title and year",
        },
        {
          status: 400,
        }
      );
    }

    return NextResponse.json(
      {
        message: "Update failed",
      },
      {
        status: 500,
      }
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