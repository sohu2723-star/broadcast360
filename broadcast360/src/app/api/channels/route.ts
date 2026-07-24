import { addChannel, fetchPaginatedChannels } from "@/services/channel.service";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { createChannelSchema } from "@/lib/validators/channel.validator";

// create channel
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = createChannelSchema.safeParse(body);

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
    const existing = await prisma.channel.findUnique({
      where: {
        name: result.data.name,
      },
    });

    if (existing) {
      return NextResponse.json(
        {
          error: "Channel name already exists",
        },
        {
          status: 409,
        },
      );
    }

    const channel = await addChannel(result.data);
    return Response.json(channel);
  } catch (error) {
    console.error("Database operation failed: to create channels", error);
    return Response.json(
      { message: "Failed to create channels" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const page = Math.max(
      1,
      parseInt(searchParams.get("page") ?? "1", 10) || 1,
    );
    const limit = Math.max(
      1,
      parseInt(searchParams.get("limit") ?? "10", 10) || 10,
    );
    const search = searchParams.get("search") ?? undefined;

    const result = await fetchPaginatedChannels(page, limit, search);
    return Response.json(result);
  } catch (error) {
    console.error("Database operation failed: to get channels", error);
    return Response.json(
      { message: "Failed to get channels" },
      { status: 500 },
    );
  }
}
