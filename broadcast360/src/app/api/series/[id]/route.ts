import { fetchSeriesById } from "@/services/series.service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const series = await fetchSeriesById(Number(id));

    return Response.json({
      data: series,
    });
  } catch (error) {
    console.error(
      "Database operation failed: get series by id",
      error
    );

    return Response.json(
      {
        message: "Failed to get series by id",
      },
      {
        status: 500,
      }
    );
  }
}