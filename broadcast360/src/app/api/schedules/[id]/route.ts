import { removeSchedule } from "@/services/schedule.service";

// DELETE SCHEDULE
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // ✅ MUST await params (Next.js requirement)
    const { id } = await params;

    if (!id) {
      return Response.json(
        { message: "Schedule id is required" },
        { status: 400 }
      );
    }

    const numericId = Number(id);

    if (isNaN(numericId)) {
      return Response.json(
        { message: "Invalid schedule id" },
        { status: 400 }
      );
    }

    await removeSchedule(numericId);

    return Response.json({
      message: "Schedule deleted successfully",
    });
  } catch (error) {
    console.error("DELETE schedule failed:", error);

    return Response.json(
      { message: "Failed to delete schedule" },
      { status: 500 }
    );
  }
}