import { NextRequest, NextResponse } from "next/server";
import { fetchUserById, removeUser } from "@/services/user.service";

/* ================= GET (View User Details) ================= */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const userId = Number(id);

    if (isNaN(userId)) {
      return NextResponse.json({ message: "Invalid user id" }, { status: 400 });
    }

    const user = await fetchUserById(userId);

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error(`GET /api/user/[id] error:`, error);

    return NextResponse.json(
      { message: "Failed to get user" },
      { status: 500 },
    );
  }
}

/* ================= DELETE (Delete User) ================= */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const userId = Number(id);

    if (isNaN(userId)) {
      return NextResponse.json({ message: "Invalid user id" }, { status: 400 });
    }

    await removeUser(userId);

    return NextResponse.json({ message: "deleted" });
  } catch (error) {
    console.error(`DELETE /api/users/[id] error:`, error);

    return NextResponse.json({ message: "Delete failed" }, { status: 500 });
  }
}
