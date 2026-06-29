import { NextRequest, NextResponse } from "next/server";
import {prisma} from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const title = searchParams.get("title");

    if (!title) {
      return NextResponse.json({ exists: false });
    }

    //  Database Query: Check if the title exists in the database
    const existingAd = await prisma.advertisement.findFirst({
      where: {
        title: {
          equals: title.trim(),
          mode: "insensitive",
        },
      },
    });

    return NextResponse.json({ exists: !!existingAd });
  } catch (error) {
    return NextResponse.json({ exists: false, error: "Internal Server Error" }, { status: 500 });
  }
}