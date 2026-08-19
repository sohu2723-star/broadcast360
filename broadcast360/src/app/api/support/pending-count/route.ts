
import { NextResponse } from "next/server";

import {
  getContactNotificationCount,
  getPremiumChatNotificationCount,
} from "@/services/support.service";

export async function GET() {
  try {
    const [
      contactMessages,
      premiumChats,
    ] = await Promise.all([
      getContactNotificationCount(),
      getPremiumChatNotificationCount(),
    ]);

    return NextResponse.json({
      contactMessages,
      premiumChats,

      total:
        contactMessages +
        premiumChats,
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
        total: 0,
      },
      {
        status: 500,
      },
    );
  }
}
