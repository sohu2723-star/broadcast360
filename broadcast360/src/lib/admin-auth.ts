import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";
import { getAdminEmails, normalizeEmail } from "@/lib/auth-policy";
import { Role, UserStatus } from "@/generated/prisma/client";

export async function getAdminFromRequest(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  if (!token) return null;

  try {
    const payload = await verifyToken(token);
    const id = Number(payload.id);
    if (!Number.isInteger(id) || id <= 0 || payload.role !== "ADMIN") {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
      },
    });

    if (!user || user.role !== Role.ADMIN || user.status !== UserStatus.ACTIVE) {
      return null;
    }

    return user;
  } catch {
    return null;
  }
}

export function getPrivilegedAdminEmail() {
  const configured = normalizeEmail(
    process.env.ADMIN_CREATOR_EMAIL || "",
  );
  return configured || getAdminEmails()[0] || "";
}

export function canCreateAccounts(email: string) {
  const normalized = normalizeEmail(email);
  return Boolean(normalized) && normalized === getPrivilegedAdminEmail() && getAdminEmails().includes(normalized);
}
