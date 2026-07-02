import { fetchMovieById } from "@/services/movie.service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const movie = await fetchMovieById(Number(id));

    return Response.json(movie);
  } catch (error) {
    console.error(
      "Database operation failed: to get movie by id",
      error
    );

    return Response.json(
      {
        message: "Failed to get movie by id",
      },
      {
        status: 500,
      }
    );
  }
}