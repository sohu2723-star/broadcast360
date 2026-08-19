import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const count = await prisma.payment.count({
      where: {
        status: "PENDING",
      },
    });

    return NextResponse.json({
      count,
    });
  } catch (error) {
    console.error(
      "Failed to get pending payment count:",
      error,
    );

    return NextResponse.json(
      {
        message: "Failed to get pending payment count",
      },
      {
        status: 500,
      },
    );
  }
}