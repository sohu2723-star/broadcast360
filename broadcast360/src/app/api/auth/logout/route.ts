import { NextResponse } from "next/server";

import { cors, optionsResponse } from "@/lib/cors";

export async function OPTIONS() {
  return optionsResponse();
}

export async function POST() {
  const response = NextResponse.json({
    success: true,

    message: "Logout successful",
  });

  response.cookies.set("token", "", {
    httpOnly: true,

    expires: new Date(0),

    sameSite: "lax",

    path: "/",
  });

  return cors(response);
}
