import { removeAdvertisement } from "@/services/advertisement.service";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await removeAdvertisement(Number(id));

    return Response.json({
      message: "Advertisement deleted",
    });
  } catch (error) {
    console.error(
      "Database operation failed: delete advertisement",
      error
    );

    return Response.json(
      {
        message: "Failed to delete advertisement",
      },
      {
        status: 500,
      }
    );
  }
}