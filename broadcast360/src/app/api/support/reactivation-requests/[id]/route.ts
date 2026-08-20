import { NextRequest, NextResponse } from "next/server";
import { getAdminFromRequest } from "@/lib/admin-auth";
import { reviewReactivationRequest } from "@/services/reactivation.service";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getAdminFromRequest(request);
  if (!admin) {
    return NextResponse.json({ message: "Admin authentication required" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const requestId = Number(id);
    const body = await request.json();
    const status = body?.status === "APPROVED" || body?.status === "REJECTED" ? body.status : null;

    if (!Number.isInteger(requestId) || requestId <= 0 || !status) {
      return NextResponse.json({ message: "A valid request id and review status are required" }, { status: 400 });
    }

    const result = await reviewReactivationRequest({
      id: requestId,
      status,
      adminId: admin.id,
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to review request";
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}
