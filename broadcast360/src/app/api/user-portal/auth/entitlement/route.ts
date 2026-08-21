import { NextRequest, NextResponse } from "next/server";

import { cors, optionsResponse } from "@/lib/cors";
import { verifyUserToken } from "@/lib/user-jwt";
import { getVodEntitlement } from "@/services/vod-entitlement.service";

export function OPTIONS() {
  return optionsResponse();
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("user_token")?.value;
    if (!token) {
      return cors(NextResponse.json({ message: "Unauthorized" }, { status: 401 }));
    }

    const payload = await verifyUserToken(token);
    const entitlement = await getVodEntitlement(Number(payload.id));

    return cors(NextResponse.json({ entitlement }));
  } catch (error) {
    console.error("VOD entitlement check failed", error);
    return cors(NextResponse.json({ message: "Unauthorized" }, { status: 401 }));
  }
}
