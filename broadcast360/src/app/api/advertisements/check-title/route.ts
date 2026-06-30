import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const title = searchParams.get("title");
    const id = searchParams.get("id"); 
    const numericId = id ? Number(id) : undefined;

    if (!title) {
      return NextResponse.json({ exists: false });
    }

    const cleanTitle = title.trim().replace(/\s+/g, " ");

    const advertisements = await prisma.advertisement.findMany({
      select: {
        id: true,
        title: true,
      },
    });

    const isDuplicate = advertisements.some((ad) => {
      const dbCleanTitle = ad.title.trim().replace(/\s+/g, " ");
      const isTitleMatch = dbCleanTitle.toLowerCase() === cleanTitle.toLowerCase();
      
      if (numericId !== undefined) {
        return isTitleMatch && ad.id !== numericId;
      }
      return isTitleMatch;
    });

    return NextResponse.json({ exists: isDuplicate });
  } catch (error) {
    console.error("Safe Title Check Error:", error);
    return NextResponse.json(
      { exists: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}