import { NextRequest, NextResponse } from "next/server";
import { fetchPaginatedUsers } from "@/services/user.service";
import { Role, UserStatus } from "@/generated/prisma";

/* ================= GET ================= */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const page = Math.max(
      1,
      parseInt(searchParams.get("page") ?? "1", 10) || 1,
    );

    const limit = Math.max(
      1,
      parseInt(searchParams.get("limit") ?? "10", 10) || 10,
    );

    const search = searchParams.get("search") ?? undefined;
    const roleParam = searchParams.get("role");
    const statusParam = searchParams.get("status");

    const validRoles = Object.values(Role) as string[];
    const validStatuses = Object.values(UserStatus) as string[];

    const role =
      roleParam && (validRoles.includes(roleParam) || roleParam === "ALL")
        ? (roleParam as Role | "ALL")
        : undefined;

    const status =
      statusParam &&
      (validStatuses.includes(statusParam) || statusParam === "ALL")
        ? (statusParam as UserStatus | "ALL")
        : undefined;

    const result = await fetchPaginatedUsers({
      page,
      limit,
      search,
      role,
      status,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/user error:", error);

    return NextResponse.json(
      { message: "Failed to fetch users" },
      { status: 500 },
    );
  }
}
