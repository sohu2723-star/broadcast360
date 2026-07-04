import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdvertisement, fetchAdvertisements } from "@/services/ads.service"; 
const advertisementSchema = z.object({
  title: z.string().min(1, "Title is required"),
  active: z.preprocess((val) => val === "true" || val === true, z.boolean()),
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const rawData = {
      title: formData.get("title"),
      active: formData.get("active"),
    };

    const result = advertisementSchema.safeParse(rawData);

    if (!result.success) {
      return NextResponse.json(
        {
          message: "Validation failed",
          errors: result.error.flatten(),
        },
        { status: 400 }
      );
    }

    const video = formData.get("video") as File | null;

    if (!video || video.size === 0) {
      return NextResponse.json(
        { message: "Video file is required" },
        { status: 400 }
      );
    }
    const newAdvertisement = await createAdvertisement(formData);
    return NextResponse.json(newAdvertisement, { status: 201 });

  } catch (error: any) {
    console.error("POST ERROR =", error);
    return NextResponse.json(
      { message: error.message || "Create error" },
      { status: 500 }
    );
  }
}

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