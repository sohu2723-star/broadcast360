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

  response.cookies.set("user_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: new Date(0),
    maxAge: 0,
    path: "/",
  });

  return cors(response);
}