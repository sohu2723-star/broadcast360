import nodemailer from "nodemailer";

import { prisma } from "@/lib/prisma";
import { hashPassword, comparePassword } from "@/lib/password";
import { assertGmailAddress } from "@/lib/auth-policy";

const CODE_TTL_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;

async function deliverVerificationEmail({ email, code }: { email: string; code: string }) {
  const emailjsServiceId = process.env.EMAILJS_SERVICE_ID;
  const emailjsTemplateId = process.env.EMAILJS_TEMPLATE_ID;
  const emailjsPublicKey = process.env.EMAILJS_PUBLIC_KEY;

  if (emailjsServiceId && emailjsTemplateId && emailjsPublicKey) {
    const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_id: emailjsServiceId,
        template_id: emailjsTemplateId,
        user_id: emailjsPublicKey,
        template_params: {
          to_email: email,
          email,
          verification_code: code,
          code,
          app_name: "Broadcast360",
        },
      }),
    });
    if (!response.ok) throw new Error("EmailJS could not send the verification code");
    return;
  }

  const transport = getTransport();
  const from = process.env.SMTP_FROM ?? process.env.SMTP_USER;
  await transport.sendMail({
    from,
    to: email,
    subject: "Broadcast360 verification code",
    text: `Your Broadcast360 verification code is ${code}. It expires in 10 minutes.`,
    html: `<div style="font-family:Arial,sans-serif"><h2>Broadcast360</h2><p>Your verification code is:</p><p style="font-size:28px;font-weight:700;letter-spacing:6px">${code}</p><p>This code expires in 10 minutes.</p></div>`,
  });
}

function getTransport() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error("Email delivery is not configured");
  }

  return nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT ?? 465),
    secure: String(process.env.SMTP_SECURE ?? "true") === "true",
    auth: { user, pass },
  });
}

function createCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function sendVerificationCode(
  rawEmail: string,
  purpose = "REGISTER",
) {
  const email = assertGmailAddress(rawEmail);
  const code = createCode();
  const codeHash = await hashPassword(code);
  const expiresAt = new Date(Date.now() + CODE_TTL_MS);

  await prisma.emailVerificationCode.deleteMany({
    where: { email, purpose, consumedAt: null },
  });
  await prisma.emailVerificationCode.create({
    data: { email, codeHash, purpose, expiresAt },
  });

  await deliverVerificationEmail({ email, code });

  return { expiresAt };
}

export async function consumeVerificationCode(
  rawEmail: string,
  rawCode: string,
  purpose = "REGISTER",
) {
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
