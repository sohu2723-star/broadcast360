import { NextRequest } from "next/server";
import { fetchPaginatedChannels } from "@/services/channel.service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
    const limit = Math.max(1, parseInt(searchParams.get("limit") ?? "10", 10) || 10);
    const search = searchParams.get("search") ?? undefined;

    const result = await fetchPaginatedChannels(page, limit, search);
    return Response.json(result);
  } catch (error) {
    console.error("Database operation failed: to get channels", error);
    return Response.json(
      { message: "Failed to get channels" },
      { status: 500 }
    );
  }
}