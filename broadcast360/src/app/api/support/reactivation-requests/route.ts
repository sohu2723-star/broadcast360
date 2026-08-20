import { NextRequest, NextResponse } from "next/server";
import { ReactivationRequestStatus } from "@/generated/prisma/client";
import { getAdminFromRequest } from "@/lib/admin-auth";
import { getReactivationRequests } from "@/services/reactivation.service";

export async function GET(request: NextRequest) {
  const admin = await getAdminFromRequest(request);
  if (!admin) {
    return NextResponse.json({ message: "Admin authentication required" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page") || 1) || 1);
  const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") || 10) || 10));
  const statusParam = searchParams.get("status");
  const status = Object.values(ReactivationRequestStatus).includes(statusParam as ReactivationRequestStatus)
    ? (statusParam as ReactivationRequestStatus)
    : undefined;

  const result = await getReactivationRequests({ page, limit, status });
  return NextResponse.json({
    data: result.data,
    pagination: {
      page,
      limit,
      total: result.total,
      totalPages: Math.ceil(result.total / limit) || 1,
    },
  });
}
