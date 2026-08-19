import { NextResponse } from "next/server";

import { cors, optionsResponse } from "@/lib/cors";

export async function OPTIONS() {
  return optionsResponse();
}

export async function POST() {
  return cors(
    NextResponse.json(
      {
        success: false,
        message: "Admin self-registration is disabled. Use the allowlisted Google Sign-In account.",
      },
      { status: 403 },
    ),
  );
}
