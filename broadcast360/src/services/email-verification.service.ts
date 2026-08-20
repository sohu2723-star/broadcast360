import nodemailer from "nodemailer";

import { prisma } from "@/lib/prisma";
import { hashPassword, comparePassword } from "@/lib/password";
import { assertGmailAddress } from "@/lib/auth-policy";

const CODE_TTL_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;
type DeliveryProvider = "SMTP" | "EmailJS";

async function deliverWithSmtp({ email, code }: { email: string; code: string }) {
  const transport = getTransport();
  const from = process.env.SMTP_FROM ?? process.env.SMTP_USER;

  await transport.verify();
  await transport.sendMail({
    from,
    to: email,
    subject: "Hxu Movie verification code",
    text: `Your Hxu Movie verification code is ${code}. It expires in 10 minutes.`,
    html: `<div style="font-family:Arial,sans-serif"><h2>Hxu Movie</h2><p>Your verification code is:</p><p style="font-size:28px;font-weight:700;letter-spacing:6px">${code}</p><p>This code expires in 10 minutes.</p></div>`,
  });
}

async function deliverWithEmailJs({ email, code }: { email: string; code: string }) {
  const emailjsServiceId = process.env.EMAILJS_SERVICE_ID;
  const emailjsTemplateId = process.env.EMAILJS_TEMPLATE_ID;
  const emailjsPublicKey = process.env.EMAILJS_PUBLIC_KEY;

  if (!emailjsServiceId || !emailjsTemplateId || !emailjsPublicKey) {
    throw new Error("EmailJS fallback is not configured");
  }

  const emailjsOrigin = process.env.USER_PORTAL_ORIGIN || "http://localhost:3001";
  const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: emailjsOrigin,
      Referer: `${emailjsOrigin.replace(/\/$/, "")}/`,
    },
    body: JSON.stringify({
      service_id: emailjsServiceId,
      template_id: emailjsTemplateId,
      user_id: emailjsPublicKey,
      template_params: {
        to_email: email,
        email,
        verification_code: code,
        code,
        app_name: "Hxu Movie",
      },
    }),
  });

  if (!response.ok) {
    const detail = (await response.text()).slice(0, 180);
    throw new Error(`EmailJS request failed (${response.status})${detail ? `: ${detail}` : ""}`);
  }
}

async function deliverVerificationEmail({ email, code }: { email: string; code: string }): Promise<DeliveryProvider> {
  try {
    await deliverWithSmtp({ email, code });
    console.info("[Email] Verification code delivered via SMTP");
    return "SMTP";
  } catch (smtpError) {
    const message = smtpError instanceof Error ? smtpError.message : "Unknown SMTP error";
    console.warn(`[Email] SMTP delivery failed; trying EmailJS fallback: ${message}`);
  }

  await deliverWithEmailJs({ email, code });
  console.info("[Email] Verification code delivered via EmailJS fallback");
  return "EmailJS";
}

function getTransport() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error("SMTP is not configured");
  }

  const timeout = Number(process.env.SMTP_TIMEOUT_MS ?? 5000);
  return nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT ?? 465),
    secure: String(process.env.SMTP_SECURE ?? "true") === "true",
    auth: { user, pass },
    connectionTimeout: timeout,
    greetingTimeout: timeout,
    socketTimeout: timeout,
  });
}

function createCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function sendVerificationCode(rawEmail: string, purpose = "REGISTER") {
  const email = assertGmailAddress(rawEmail);
  const code = createCode();
  const codeHash = await hashPassword(code);
  const expiresAt = new Date(Date.now() + CODE_TTL_MS);

  await prisma.emailVerificationCode.deleteMany({
    where: { email, purpose, consumedAt: null },
  });
  const record = await prisma.emailVerificationCode.create({
    data: { email, codeHash, purpose, expiresAt },
  });

  try {
    const provider = await deliverVerificationEmail({ email, code });
    return { expiresAt, provider };
  } catch (error) {
    await prisma.emailVerificationCode.delete({ where: { id: record.id } }).catch(() => undefined);
    throw error;
  }
}

export async function consumeVerificationCode(rawEmail: string, rawCode: string, purpose = "REGISTER") {
  const email = assertGmailAddress(rawEmail);
  const code = rawCode.trim();
  if (!/^\d{6}$/.test(code)) {
    throw new Error("Verification code must be 6 digits");
  }

  const record = await prisma.emailVerificationCode.findFirst({
    where: { email, purpose, consumedAt: null },
    orderBy: { createdAt: "desc" },
  });
  if (!record || record.expiresAt.getTime() < Date.now()) {
    throw new Error("Verification code expired or not found");
  }
  if (record.attempts >= MAX_ATTEMPTS) {
    throw new Error("Too many verification attempts");
  }

  const valid = await comparePassword(code, record.codeHash);
  if (!valid) {
    await prisma.emailVerificationCode.update({
      where: { id: record.id },
      data: { attempts: { increment: 1 } },
    });
    throw new Error("Invalid verification code");
  }

  await prisma.emailVerificationCode.update({
    where: { id: record.id },
    data: { consumedAt: new Date() },
  });
  return true;
}
