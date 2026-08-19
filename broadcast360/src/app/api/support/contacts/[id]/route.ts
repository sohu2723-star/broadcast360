
import { NextResponse } from "next/server";

import {
  fetchContactMessageById,
  changeContactMessageStatus,
} from "@/services/support.service";

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

    const message =
      await fetchContactMessageById(
        Number(id),
      );

    if (!message) {
      return NextResponse.json(
        {
          message: "Message not found",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json(message);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message:
          "Failed to load contact message",
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

    const status =
      body.status as
        | "NEW"
        | "READ"
        | "RESOLVED";

    if (
      ![
        "NEW",
        "READ",
        "RESOLVED",
      ].includes(status)
    ) {
      return NextResponse.json(
        {
          message: "Invalid status",
        },
        {
          status: 400,
        },
      );
    }

    const result =
      await changeContactMessageStatus(
        Number(id),
        status,
      );

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message:
          "Failed to update message",
      },
      {
        status: 500,
      },
    );
  }
}
