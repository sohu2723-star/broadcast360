import { NextRequest, NextResponse } from "next/server";
import { NewsRepository } from "@/repositories/news.repository";
import { prisma } from "@/lib/prisma";
import { getAdminFromRequest } from "@/lib/admin-auth";


export async function POST(request: NextRequest) {
  const admin = await getAdminFromRequest(request);
  if (!admin) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const type = typeof body.type === "string" ? body.type.trim() : "Recorded VIDEO";
    if (!title) return NextResponse.json({ message: "Title is required" }, { status: 400 });

    const news = await prisma.news.create({
      data: {
        title,
        type: type || "Recorded VIDEO",
        content: typeof body.content === "string" ? body.content.trim() || null : null,
        videoUrl: typeof body.videoUrl === "string" ? body.videoUrl.trim() || null : null,
        duration: body.duration ? Number(body.duration) : null,
        channelId: body.channelId ? Number(body.channelId) : null,
      },
    });
    return NextResponse.json({ success: true, data: news }, { status: 201 });
  } catch (error) {
    console.error("CREATE NEWS ERROR", error);
    return NextResponse.json({ message: "Failed to create news" }, { status: 500 });
  }
}

export async function GET() {

  try {

    const news =
      await NewsRepository.findAll();


    return NextResponse.json(
      news,
      {
        status:200,
      }
    );


  } catch(error){

    console.error(
      "GET NEWS ERROR",
      error
    );


    return NextResponse.json(
      {
        message:"Failed to fetch news"
      },
      {
        status:500,
      }
    );

  }

}