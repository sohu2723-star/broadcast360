import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getAdminFromRequest } from "@/lib/admin-auth";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminFromRequest(request);
  if (!admin) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const newsId = Number(id);
  if (!Number.isInteger(newsId) || newsId <= 0) return NextResponse.json({ message: "Invalid news id" }, { status: 400 });

  const news = await prisma.news.findUnique({ where: { id: newsId }, include: { channel: true } });
  if (!news) return NextResponse.json({ message: "News not found" }, { status: 404 });
  return NextResponse.json({ success: true, data: news });
}
