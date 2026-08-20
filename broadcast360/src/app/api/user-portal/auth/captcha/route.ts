import { NextResponse } from "next/server";

import { createCaptchaChallenge } from "@/lib/captcha";
import { cors, optionsResponse } from "@/lib/cors";

export async function OPTIONS() {
  return optionsResponse();
}

export async function GET() {
  const challenge = createCaptchaChallenge();
  return cors(NextResponse.json({ success: true, ...challenge }));
}
