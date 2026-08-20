
import { NextResponse } from "next/server";

import {
  getContactNotificationCount,
  getPremiumChatNotificationCount,
  getReactivationNotificationCount,
} from "@/services/support.service";

export async function GET() {
  try {
    const [
      contactMessages,
      premiumChats,
      reactivationRequests,
    ] = await Promise.all([
      getContactNotificationCount(),
      getPremiumChatNotificationCount(),
      getReactivationNotificationCount(),
    ]);

    return NextResponse.json({
      contactMessages,
      premiumChats,
      reactivationRequests,

      total:
        contactMessages +
        premiumChats +
        reactivationRequests,
    });
  } catch (error) {
    console.error(
      "SUPPORT PENDING COUNT ERROR:",
      error,
    );

    return NextResponse.json(
      {
        contactMessages: 0,
        premiumChats: 0,
        reactivationRequests: 0,
        total: 0,
      },
      {
        status: 500,
      },
    );
  }
}
