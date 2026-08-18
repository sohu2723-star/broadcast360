
import { NextRequest, NextResponse } from "next/server";

import {
  fetchContactMessages,
} from "@/services/support.service";

export async function GET(
  request: NextRequest,
) {
  try {
    const searchParams =
      request.nextUrl.searchParams;

    const page =
      Number(searchParams.get("page") ?? "1");

    const limit =
      Number(searchParams.get("limit") ?? "10");

    const status =
      searchParams.get("status") as
        | "NEW"
        | "READ"
        | "RESOLVED"
        | null;

    const result =
      await fetchContactMessages(
        page,
        limit,
        status ?? undefined,
      );

    return NextResponse.json(result);
  } catch (error) {
    console.error(
      "ADMIN CONTACT MESSAGE ERROR:",
      error,
    );

    return NextResponse.json(
      {
        message:
          "Failed to load contact messages",
      },
      {
        status: 500,
      },
    );
  }
}
