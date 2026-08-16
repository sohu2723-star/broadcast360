import { NextRequest, NextResponse } from "next/server";

import { verifyUserToken } from "@/lib/user-jwt";
import { fetchPaginatedSubscriptionOptions } from "@/services/subscription-option.service";
import { cors, optionsResponse } from "@/lib/cors";

export async function OPTIONS() {
  return optionsResponse();
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("user_token")?.value;

    if (!token) {
      return cors(
        NextResponse.json(
          {
            message: "Unauthorized",
          },
          { status: 401 },
        ),
      );
    }

    await verifyUserToken(token);

    const { searchParams } = new URL(request.url);

    const page = Math.max(
      1,
      parseInt(searchParams.get("page") ?? "1", 10) || 1,
    );

    const limit = Math.max(
      1,
      parseInt(searchParams.get("limit") ?? "20", 10) || 20,
    );

    const result =
      await fetchPaginatedSubscriptionOptions(
        page,
        limit,
      );

    // User portal should only see active options
    result.data = result.data.filter(
      (option) => option.isActive,
    );

    return cors(
      NextResponse.json(result),
    );
  } catch (error) {
    console.error(
      "Failed to get user subscription options:",
      error,
    );

    return cors(
      NextResponse.json(
        {
          message:
            "Failed to get subscription options",
        },
        { status: 500 },
      ),
    );
  }
}