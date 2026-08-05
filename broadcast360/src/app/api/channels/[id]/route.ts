import {
  fetchChannelById,
  editChannel,
  removeChannel,
  updateDefaultPlaylist,
} from "@/services/channel.service";

import { updateChannelSchema } from "@/lib/validators/channel.validator";

import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  },
) {
  try {
    const { id } = await params;

    const channel = await fetchChannelById(Number(id));

    return NextResponse.json(channel);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: "Failed get channel",
      },
      {
        status: 500,
      },
    );
  }
}

export async function PUT(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  },
) {
  try {
    const { id } = await params;

    const channelId = Number(id);

    const body = await request.json();

    const result = updateChannelSchema.safeParse(body);

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

    const existing = await prisma.channel.findFirst({
      where: {
        name: result.data.name,

        NOT: {
          id: channelId,
        },
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

    const channel = await editChannel(channelId, result.data);

    return NextResponse.json(channel);
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed update",
      },
      {
        status: 500,
      },
    );
  }
}

export async function PATCH(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  },
) {
  try {
    const { id } = await params;

    const body = await request.json();

    const channel = await updateDefaultPlaylist(
      Number(id),

      body.defaultPlaylistId ? Number(body.defaultPlaylistId) : null,
    );

    return NextResponse.json(channel);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: "Failed update playlist",
      },
      {
        status: 500,
      },
    );
  }
}

export async function DELETE(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  },
) {
  try {
    const { id } = await params;

    await removeChannel(Number(id));

    return NextResponse.json({
      message: "Channel deleted",
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Delete failed",
      },
      {
        status: 500,
      },
    );
  }
}
