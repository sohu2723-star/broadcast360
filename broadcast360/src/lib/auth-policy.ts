import { randomBytes } from "node:crypto";

const DEFAULT_ADMIN_EMAILS = ["copy2723@gmail.com", "minbanyarchan639@gmail.com"];

export function normalizeEmail(value: unknown): string {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

export function isGmailAddress(email: string): boolean {
  return /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@gmail\.com$/.test(
    normalizeEmail(email),
  );
}

export function assertGmailAddress(email: string): string {
  const normalized = normalizeEmail(email);
  if (!isGmailAddress(normalized)) {
    throw new Error("Only @gmail.com email addresses are allowed");
  }
  return normalized;
}

export function getAdminEmails(): string[] {
  const configured = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map(normalizeEmail)
    .filter(Boolean);
  return [...new Set([...DEFAULT_ADMIN_EMAILS, ...configured])].filter(isGmailAddress);
}

export function isAllowedAdminEmail(email: string): boolean {
  return getAdminEmails().includes(normalizeEmail(email));
}

export function createTemporaryPassword(): string {
  return randomBytes(32).toString("hex");
}

export function getGoogleClientId(): string {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    throw new Error("GOOGLE_CLIENT_ID is not configured");
  }
  return clientId;
}
