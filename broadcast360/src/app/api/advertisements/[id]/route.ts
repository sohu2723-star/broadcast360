import { NextRequest, NextResponse } from "next/server";

import {
  fetchAdvertisementById,
  editAdvertisement,
} from "@/services/advertisement.service";
/*  GET ADVERTISEMENT BY ID */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    return NextResponse.json(advertisement);
  } catch (error) {
    console.error("GET ERROR =", error);
    return NextResponse.json({ message: "Failed to fetch advertisement" }, { status: 500 });
  }
}

/*  UPDATE ADVERTISEMENT */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const advertisementId = Number(id);

    if (isNaN(advertisementId)) {
      return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
    }

    const formData = await req.formData();
    const advertisement = await editAdvertisement(advertisementId, formData);

    return NextResponse.json(advertisement);
  } catch (error) {
    console.error("PUT ERROR =", error);
    return NextResponse.json({ message: "Update failed" }, { status: 500 });
  }
}