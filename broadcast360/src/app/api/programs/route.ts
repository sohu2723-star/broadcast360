import { NextResponse, NextRequest } from "next/server";
import { addProgram } from "@/services/program.service";
import { createProgramSchema } from "@/lib/validators/program.validator";
import { prisma } from "@/lib/prisma";
import { programService } from "@/services/program.service";
import { ProgramType } from "@/generated/prisma/client";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const result = createProgramSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          errors: result.error.flatten().fieldErrors,
        },
        {
          status: 400,
        },
      );
    }

    const program = await addProgram(result.data);

    return NextResponse.json(
      {
        message: "Program created successfully",
        data: program,
      },

      {
        status: 201,
      },
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        message: "Failed to create program",
      },
      {
        status: 500,
      },
    );
  }
}

//  program list with filters and pagination

// export async function GET(req: NextRequest) {
//   try {
//     const { searchParams } = new URL(req.url);

//     // Pagination Parameters
//     const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
//     const limit = Math.max(1, parseInt(searchParams.get("limit") || "10", 10));

//     const filters = {
//       search: searchParams.get("search") || undefined,
//       type: searchParams.get("type") || undefined,
//       channelName: searchParams.get("channel") || undefined, // e.g. "HBO" or "Sports HD"
//       page,
//       limit,
//     };

//     const formattedData = await programService.getAllPrograms(filters);

//     const totalCount = await prisma.program.count({
//       where: {
//         OR: filters.search
//           ? [{ title: { contains: filters.search, mode: "insensitive" } }]
//           : undefined,
//         type: filters.type as any,

//         // 👇 FIX: Change strict match to case-insensitive mode contains match
//         channel: filters.channelName
//           ? {
//               name: {
//                 contains: filters.channelName,
//                 mode: "insensitive",
//               },
//             }
//           : undefined,
//       },
//     });

//     const totalPages = Math.ceil(totalCount / limit);
//     const activeChannels = await prisma.channel.findMany({
//       select: { name: true },
//       orderBy: { name: "asc" },
//     });
//     const programTypes = Object.values(ProgramType);

//     return NextResponse.json(
//       {
//         data: formattedData,
//         meta: {
//           channels: activeChannels.map((c) => c.name),
//           programTypes: programTypes,
//           pagination: {
//             currentPage: page,
//             limit: limit,
//             totalCount: totalCount,
//             totalPages: totalPages,
//             hasNextPage: page < totalPages,
//             hasPrevPage: page > 1,
//           },
//         },
//       },
//       { status: 200 },
//     );
//   } catch (error: unknown) {
//     console.error("[PROGRAMS GET API ERROR]:", error);
//     return NextResponse.json(
//       { message: "Internal Server Error" },
//       { status: 500 },
//     );
//   }
// }

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const channelIdParam = searchParams.get("channelId");

    // ====================================================
    // 1. FAST INTERCEPT FOR SCHEDULE DROPDOWN (Matches numerical IDs)
    // ====================================================
    if (channelIdParam) {
      const targetChannelId = Number(channelIdParam);
      
      if (isNaN(targetChannelId)) {
        return NextResponse.json({ message: "Invalid channelId format" }, { status: 400 });
      }

      const dropdownPrograms = await prisma.program.findMany({
        where: {
          channelId: targetChannelId,
        },
        select: {
          id: true,
          title: true,
        },
        orderBy: {
          title: "asc",
        },
      });

      const formattedPrograms = dropdownPrograms.map((p) => ({
        id: p.id,
        name: p.title,
      }));

      return NextResponse.json({ data: formattedPrograms });
    }

    // ====================================================
    // 2. STANDARD FILTER PARSING FOR DASHBOARD DATA
    // ====================================================
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, parseInt(searchParams.get("limit") || "10", 10));
    const channelName = searchParams.get("channel") || undefined;

    const filters = {
      search: searchParams.get("search") || undefined,
      type: searchParams.get("type") || undefined,
      channelName,
      page,
      limit,
    };

    // 👇 FIX: Using your explicit service instance ensures your main list receives data rows
    const formattedData = await programService.getAllPrograms(filters);
    
    const totalCount = await prisma.program.count({
      where: {
        OR: filters.search 
          ? [{ title: { contains: filters.search, mode: "insensitive" } }] 
          : undefined,
        type: filters.type as ProgramType,
        channel: filters.channelName 
          ? { name: { contains: filters.channelName, mode: "insensitive" } } 
          : undefined,
      },
    });

    const totalPages = Math.ceil(totalCount / limit);

    const activeChannels = await prisma.channel.findMany({
      select: { name: true },
      orderBy: { name: "asc" },
    });
    
    const programTypes = Object.values(ProgramType);

    return NextResponse.json({
      data: formattedData,
      meta: {
        channels: activeChannels.map((c) => c.name),
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

  } catch (error) {
    console.error("[PROGRAMS GET API ERROR]:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}