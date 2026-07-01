import { NextRequest, NextResponse } from "next/server";
import { programService } from "@/services/program.service"; // 🎯 Clean Import

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  try {
    const { id: rawId } = await params;
    const id = parseInt(rawId, 10);

    if (isNaN(id)) {
      return NextResponse.json({ message: "Invalid parameter numeric ID" }, { status: 400 });
    }

    await programService.deleteProgram(id);

    return NextResponse.json({ message: "Program deleted successfully" }, { status: 200 });
  } catch (error: any) {
    console.error("[PROGRAM DELETE API ERROR]:", error);
    const statusCode = error.message.includes("not found") ? 404 : 500;
    return NextResponse.json({ message: error.message || "Internal Server Error" }, { status: statusCode });
  }
}