import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { assertGmailAddress } from "@/lib/auth-policy";
import { createReactivationRequest } from "@/services/reactivation.service";

const reactivationSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().toLowerCase().email().endsWith("@gmail.com"),
  message: z.string().trim().min(10).max(2000),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = reactivationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Please provide your name, Gmail, and a message of at least 10 characters." },
        { status: 400 },
      );
    }

    const email = assertGmailAddress(parsed.data.email);
    const requestRecord = await createReactivationRequest({
      ...parsed.data,
      email,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Your reactivation request has been sent to the admin team.",
        requestId: requestRecord.id,
      },
      { status: 201 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to send reactivation request";
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}
