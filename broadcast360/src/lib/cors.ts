import { NextResponse } from "next/server";

export function cors(response: NextResponse) {
  response.headers.set(
    "Access-Control-Allow-Origin",
    "http://localhost:3001",
  );

  response.headers.set(
    "Access-Control-Allow-Credentials",
    "true",
  );

  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS",
  );

  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type",
  );

  return response;
}


export function optionsResponse() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "http://localhost:3001",
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Methods":
        "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers":
        "Content-Type",
    },
  });
}