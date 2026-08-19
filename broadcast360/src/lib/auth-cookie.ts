import { NextResponse } from "next/server";

const isProduction = process.env.NODE_ENV === "production";

function setSessionCookie(response: NextResponse, name: string, token: string) {
  response.cookies.set(name, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
  return response;
}

export function setAuthCookie(response: NextResponse, token: string) {
  return setSessionCookie(response, "token", token);
}

export function setUserAuthCookie(response: NextResponse, token: string) {
  return setSessionCookie(response, "user_token", token);
}
