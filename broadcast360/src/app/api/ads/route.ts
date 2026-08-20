import { NextRequest, NextResponse } from "next/server";
import { createAdvertisementSchema } from "@/lib/validators/advertisement.validator"; 
import { createAdvertisement, fetchAdvertisements } from "@/services/ads.service";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const title = String(formData.get("title") ?? "").trim();
    const activeRaw = formData.get("active");
    const active = activeRaw === "true" || activeRaw === "1";
    const video = formData.get("video");
    const thumbnail = formData.get("thumbnail");
    const videoUrl = String(formData.get("videoUrl") ?? "").trim();
    const thumbnailUrl = String(formData.get("thumbnailUrl") ?? "").trim();
    const duration = String(formData.get("duration") ?? "");

    if (!title) {
      return NextResponse.json(
        { message: "Advertisement title is required" },
        { status: 400 },
      );
    }
    if ((!(video instanceof File) || video.size <= 0) && !videoUrl) {
      return NextResponse.json(
        { message: "Advertisement video file is required" },
        { status: 400 },
      );
    }

    const processedFormData = new FormData();
    processedFormData.append("title", title);
    processedFormData.append("active", String(active));
    if (video instanceof File && video.size > 0) processedFormData.append("video", video);
    if (thumbnail instanceof File && thumbnail.size > 0) processedFormData.append("thumbnail", thumbnail);
    if (videoUrl) processedFormData.append("videoUrl", videoUrl);
    if (thumbnailUrl) processedFormData.append("thumbnailUrl", thumbnailUrl);
    if (duration) processedFormData.append("duration", duration);

    const newAdvertisement = await createAdvertisement(processedFormData);
    return NextResponse.json(newAdvertisement, { status: 201 });

  } catch (error: unknown) {
    console.error("POST ERROR =", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Advertisement create failed",
      },
      { status: 500 },
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