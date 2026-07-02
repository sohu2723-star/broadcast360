import { NextRequest, NextResponse } from "next/server";
import {
  fetchAdvertisementById,
} from "@/services/advertisement.service";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const advertisementId = Number(id);

    if (isNaN(advertisementId)) {
      return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
    }
    
    const advertisement = await fetchAdvertisementById(advertisementId);

    if (!advertisement) {
      return NextResponse.json({ message: "Advertisement not found" }, { status: 404 });
    }

    return NextResponse.json({
      data: {
        id: advertisement.id,
        title: advertisement.title,
        videoUrl: advertisement.videoUrl,
        duration: advertisement.duration,
        active: advertisement.active,
        createdAt: advertisement.createdAt instanceof Date 
          ? advertisement.createdAt.toISOString().split("T")[0] 
          : advertisement.createdAt,
      }
    }, { status: 200 });

  } catch (error) {
    console.error("GET ERROR =", error);
    return NextResponse.json({ message: "Failed to fetch advertisement" }, { status: 500 });
  }
}


