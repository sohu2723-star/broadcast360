import { NextRequest, NextResponse } from "next/server";

import {
  fetchMovieById,
  removeMovie,
  editMovie,
} from "@/services/movie.service";

/*  GET MOVIE BY ID */
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
    console.error("GET ERROR =", error);

    return NextResponse.json(
      { message: "Failed to fetch movie" },
      { status: 500 }
    );
  }
}

/*  UPDATE MOVIE */
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

    const body = await req.json();

    const movie = await editMovie(movieId, {
      title: body.title,
      description: body.description,
      releaseYear: Number(body.releaseYear),
    });

    return NextResponse.json(movie);
  } catch (error) {
    console.error("PUT ERROR =", error);

    return NextResponse.json(
      { message: "Update failed" },
      { status: 500 }
    );
  }
}

/*  DELETE MOVIE */
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

    await removeMovie(movieId);

    return NextResponse.json({
      message: "Movie deleted successfully",
    });
  } catch (error) {
    console.error("DELETE ERROR =", error);

    return NextResponse.json(
      { message: "Delete failed" },
      { status: 500 }
    );
  }
}