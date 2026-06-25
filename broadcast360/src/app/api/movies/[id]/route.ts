import { fetchMovieById, removeMovie } from "@/services/movie.service";

// GET MOVIE BY ID
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const movie = await fetchMovieById(Number(id));

    if (!movie) {
      return Response.json(
        { message: "Movie not found" },
        { status: 404 }
      );
    }

    return Response.json(movie);
  } catch (error) {
    console.error("Database operation failed: to get movie by id", error);
    return Response.json(
      { message: "Failed to get movie by id" },
      { status: 500 }
    );
  }
}

// DELETE MOVIE
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const movie = await fetchMovieById(Number(id));
    if (!movie) {
      return Response.json(
        { message: "Movie not found" },
        { status: 404 }
      );
    }

    await removeMovie(Number(id));
    
    return Response.json({
      message: "Movie deleted successfully"
    });
  } catch (error) {
    console.error("Database operation failed: to delete movie", error);
    return Response.json(
      { message: "Failed to delete movie" },
      { status: 500 }
    );
  }
}