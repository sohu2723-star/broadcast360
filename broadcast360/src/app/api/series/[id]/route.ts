import { NextRequest } from "next/server";
import { removeSeries } from "@/services/series.service";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {

    const resolvedParams = await params;
    const seriesId = parseInt(resolvedParams.id, 10);

    
    if (!seriesId || isNaN(seriesId)) {
      return Response.json(
        { message: "Invalid or missing Series ID" },
        { status: 400 }
      );
    }

   
    await removeSeries(seriesId);

    return Response.json(
      { message: "Series and all its related episodes have been deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error occurred while deleting series:", error);
    
    return Response.json(
      { message: "Failed to delete series", error: error.message },
      { status: 500 }
    );
  }
}