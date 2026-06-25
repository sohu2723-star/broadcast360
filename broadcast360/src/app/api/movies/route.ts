import { NextRequest } from "next/server";
import { fetchPaginatedMovies } from "@/services/movie.service";

// GET ALL MOVIES (WITH PAGINATION)
export async function GET(request: NextRequest) {
  try {
    
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
    const limit = Math.max(1, parseInt(searchParams.get("limit") ?? "10", 10) || 10);
    const result = await fetchPaginatedMovies(page, limit);
    
    return Response.json(result);
  } catch (error) {
    console.error("Database operation failed: to get movies", error);
    return Response.json(
      { message: "Failed to get movies" },
      { status: 500 }
    );
  }
}