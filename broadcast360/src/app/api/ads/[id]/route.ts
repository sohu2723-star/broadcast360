import { NextRequest, NextResponse } from "next/server";
import {
  fetchAdvertisementById,
  editAdvertisement,
  removeAdvertisement
} from "@/services/ads.service";

/* GET ADVERTISEMENT BY ID */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const advertisementId = Number(id);

    if (isNaN(advertisementId)) {
      return NextResponse.json(
        { message: "Invalid ID" },
        { status: 400 }
      );
    }

    const advertisement =
      await fetchAdvertisementById(advertisementId);

    if (!advertisement) {
      return NextResponse.json(
        { message: "Advertisement not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        data: {
          id: advertisement.id,
          title: advertisement.title,
          videoUrl: advertisement.videoUrl,
          duration: advertisement.duration,
          active: advertisement.active,
          createdAt:
            advertisement.createdAt instanceof Date
              ? advertisement.createdAt
                  .toISOString()
                  .split("T")[0]
              : advertisement.createdAt,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET ERROR =", error);

    return NextResponse.json(
      { message: "Failed to fetch advertisement" },
      { status: 500 }
    );
  }
}

/* UPDATE ADVERTISEMENT */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const advertisementId = Number(id);

    if (isNaN(advertisementId)) {
      return NextResponse.json(
        { message: "Invalid ID" },
        { status: 400 }
      );
    }

    const formData = await req.formData();

    const advertisement = await editAdvertisement(
      advertisementId,
      formData
    );

    return NextResponse.json(
      { data: advertisement },
      { status: 200 }
    );
  } catch (error) {
    console.error("PUT ERROR =", error);

    return NextResponse.json(
      { message: "Update failed" },
      { status: 500 }
    );
  }
}


// DELETE ADVERTISEMENT
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