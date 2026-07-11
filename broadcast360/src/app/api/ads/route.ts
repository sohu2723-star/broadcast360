import { NextRequest, NextResponse } from "next/server";
import { createAdvertisementSchema } from "@/lib/validators/advertisement.validator"; 
import { createAdvertisement, fetchAdvertisements } from "@/services/ads.service";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const title = formData.get("title");
    const active = formData.get("active");
    const video = formData.get("video");
    const thumbnail = formData.get("thumbnail");

    const rawData: any = {
      title,
      active,
      video,
    };

    if (thumbnail && thumbnail instanceof File && thumbnail.size > 0) {
      rawData.thumbnail = thumbnail;
    } else {
      rawData.thumbnail = undefined;
    }

    const result = createAdvertisementSchema.safeParse(rawData);

    if (!result.success) {
      return NextResponse.json(
        {
          message: "Validation failed",
          errors: result.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const validatedData = result.data;
    const processedFormData = new FormData();
    processedFormData.append("title", validatedData.title);
    processedFormData.append("active", String(validatedData.active));
    processedFormData.append("video", validatedData.video);
    
    if (validatedData.thumbnail) {
      processedFormData.append("thumbnail", validatedData.thumbnail);
    }

    const newAdvertisement = await createAdvertisement(processedFormData);
    return NextResponse.json(newAdvertisement, { status: 201 });

  } catch (error: unknown) {
    console.error("POST ERROR =", error);
    return NextResponse.json(
      { message: error || "Create error" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 5;
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "all";

    const result = await fetchAdvertisements(page, limit, search, status);
    const formattedAdvertisements = result.advertisements.map((ad: any) => {
      return {
        id: ad.id,
        title: ad.title,
        duration: ad.duration ? Number(String(ad.duration).replace('s', '')) : 0,
        status: ad.active ? "Active" : "Inactive", 
        active: ad.active,
        createdAt: ad.createdAt instanceof Date 
          ? ad.createdAt.toLocaleDateString() 
          : ad.createdAt,
        thumbnailUrl: ad.thumbnailUrl || ad.thumbnail || null,
        videoUrl: ad.videoUrl || ad.video || null
      };
    });

    return NextResponse.json({
      data: formattedAdvertisements, 
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
      },
    }, { status: 200 });

  } catch (error: any) {
    console.error("GET ERROR =", error);
    return NextResponse.json(
      { message: error.message || "Failed to fetch advertisements" },
      { status: 500 }
    );
  }
}