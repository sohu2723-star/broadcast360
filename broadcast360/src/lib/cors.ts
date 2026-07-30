import { NextResponse } from "next/server";

const ALLOWED_ORIGIN = process.env.USER_PORTAL_URL ?? "http://localhost:3001";

export function cors(response: NextResponse) {
  response.headers.set("Access-Control-Allow-Origin", ALLOWED_ORIGIN);

  response.headers.set("Access-Control-Allow-Credentials", "true");

  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,DELETE,OPTIONS",
  );

  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization",
  );

  return response;
}

export function optionsResponse() {
  return new NextResponse(null, {
    status: 204,

    headers: {
      "Access-Control-Allow-Origin": ALLOWED_ORIGIN,

      "Access-Control-Allow-Credentials": "true",

      "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",

      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
