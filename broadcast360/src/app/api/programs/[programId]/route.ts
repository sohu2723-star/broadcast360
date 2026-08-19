import { NextResponse, NextRequest } from "next/server";
import { editProgram, fetchProgramDetails } from "@/services/program.service";
import { updateProgramSchema } from "@/lib/validators/program.validator";
import { programService } from "@/services/program.service";

export async function PUT(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ programId: string }>;
  },
) {
  try {
    const body = await request.json();

    const { programId: id } = await params;

    const result = updateProgramSchema.safeParse(body);

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

    const program = await editProgram(Number(id), result.data);

    return NextResponse.json({
      message: "Program updated successfully",
      data: program,
    });
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      {
        message: "Failed to update program",
      },
      {
        status: 500,
      },
    );
  }
}

export async function GET(
  request: Request,
  {
    params,
  }: {
    params: Promise<{
      programId: string;
    }>;
  },
) {
  try {
    const { programId } = await params;

    const id = Number(programId);
    if (isNaN(id)) {
      return NextResponse.json(
        {
          message: "Invalid programId",
        },
        {
          status: 400,
        },
      );
    }

    const program = await fetchProgramDetails(id);
    if (!program) {
      return NextResponse.json(
        {
          message: "Program not found",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json({
      data: {
        id: program.id,

        channel: program.channel.name,

        title: program.title,

        type: program.type,

        description: program.description,

        createdAt: program.createdAt,
      },
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: "Failed to get program",
      },

      {
        status: 500,
      },
    );
  }
}

interface RouteContext {
  params: Promise<{ programId: string }>;
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  try {
    const { programId: rawId } = await params;
    const id = parseInt(rawId, 10);

    if (isNaN(id)) {
      return NextResponse.json(
        { message: "Invalid parameter numeric ID" },
        { status: 400 },
      );
    }

    await programService.deleteProgram(id);

    return NextResponse.json(
      { message: "Program deleted successfully" },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("[PROGRAM DELETE API ERROR]:", error);
    const statusCode = error.message.includes("not found") ? 404 : 500;
    return NextResponse.json(
      { message: error.message || "Internal Server Error" },
      { status: statusCode },
    );
  }
}
