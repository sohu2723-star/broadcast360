import { fetchAdvertisements } from "@/services/advertisement.service";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 5;
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "all";

  const result = await fetchAdvertisements(
    page,
    limit,
    search,
    status
  );

  return Response.json({
    data: result.advertisements,
    pagination: {
      page,
      limit,
      total: result.total,
      totalPages: Math.ceil(result.total / limit),
    },
  });
}