import { NextRequest, NextResponse } from "next/server";
import { programService } from "@/services/program.service";
import { prisma } from "@/lib/prisma";
import { ProgramType } from "@/generated/prisma/enums"; 

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    
    // Pagination Parameters
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, parseInt(searchParams.get("limit") || "10", 10));

    const filters = {
      search: searchParams.get("search") || undefined, 
      type: searchParams.get("type") || undefined,
      channelName: searchParams.get("channel") || undefined,
      page,    
      limit,   
    };

    const formattedData = await programService.getAllPrograms(filters);
    const totalCount = await prisma.program.count({
      where: {
        OR: filters.search ? [
          { title: { contains: filters.search, mode: "insensitive" } },
        ] : undefined,
        type: filters.type as any,
        channel: filters.channelName ? { name: filters.channelName } : undefined,
      },
    });

    const totalPages = Math.ceil(totalCount / limit);
    const activeChannels = await prisma.channel.findMany({
      select: { name: true },
      orderBy: { name: "asc" }
    });
    const programTypes = Object.values(ProgramType);

    return NextResponse.json({ 
      data: formattedData, 
      meta: {
        channels: activeChannels.map(c => c.name),
        programTypes: programTypes,
        pagination: {
          currentPage: page,
          limit: limit,
          totalCount: totalCount,
          totalPages: totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    }, { status: 200 });

  } catch (error: any) {
    console.error("[PROGRAMS GET API ERROR]:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}