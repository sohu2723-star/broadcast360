import { NextRequest, NextResponse } from "next/server";
import { updateAdvertisementSchema } from "@/lib/validators/advertisement.validator";
import {
  fetchAdvertisementById,
  editAdvertisement,
  removeAdvertisement
} from "@/services/ads.service";

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

    const advertisement = await fetchAdvertisementById(advertisementId);

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
          thumbnailUrl: advertisement.thumbnailUrl, 
          duration: advertisement.duration,
          active: advertisement.active,
          createdAt:
            advertisement.createdAt instanceof Date
              ? advertisement.createdAt.toISOString().split("T")[0]
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
    const title = formData.get("title");
    const active = formData.get("active");
    const video = formData.get("video");
    const thumbnail = formData.get("thumbnail");
    const rawData: any = { title, active };
    if (video && video instanceof File && video.size > 0) rawData.video = video;
    if (thumbnail && thumbnail instanceof File && thumbnail.size > 0) rawData.thumbnail = thumbnail;
    const result = updateAdvertisementSchema.safeParse(rawData);

    if (!result.success) {
      return NextResponse.json(
        { message: "Validation failed", errors: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const validatedData = result.data;
    const processedFormData = new FormData();
    processedFormData.append("title", validatedData.title);
    processedFormData.append("active", String(validatedData.active));
    
    if (validatedData.video) processedFormData.append("video", validatedData.video);
    if (validatedData.thumbnail) processedFormData.append("thumbnail", validatedData.thumbnail);

    const advertisement = await editAdvertisement(
      advertisementId,
      processedFormData
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

/* DELETE ADVERTISEMENT */
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
      { message: "Failed to delete advertisement" },
      { status: 500 }
    );
  }
}