import crypto from "node:crypto";

const CHALLENGE_TTL_SECONDS = 10 * 60;
const CHALLENGE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function getSecret() {
  return process.env.JWT_SECRET_USER || process.env.JWT_SECRET || "broadcast360-development-captcha-secret";
}

function sign(value: string) {
  return crypto.createHmac("sha256", getSecret()).update(value).digest("hex");
}

function digestAnswer(answer: string) {
  return crypto.createHash("sha256").update(answer.trim().toUpperCase()).digest("hex");
}

export function createCaptchaChallenge() {
  const answer = Array.from({ length: 5 }, () => CHALLENGE_ALPHABET[crypto.randomInt(CHALLENGE_ALPHABET.length)]).join("");
  const issuedAt = Math.floor(Date.now() / 1000);
  const payload = `${answer}.${issuedAt}`;
  const token = Buffer.from(`${payload}.${sign(payload)}`).toString("base64url");

  return {
    token,
    prompt: "Enter the 5 characters shown",
    display: answer,
    expiresIn: CHALLENGE_TTL_SECONDS,
  };
}

export function verifyCaptchaChallenge(token: unknown, answer: unknown) {
  if (typeof token !== "string" || typeof answer !== "string") return false;

  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    const [expectedAnswer, issuedAtText, signature] = decoded.split(".");
    const issuedAt = Number(issuedAtText);
    if (!expectedAnswer || !issuedAtText || !signature || !Number.isFinite(issuedAt)) return false;
    if (Math.floor(Date.now() / 1000) - issuedAt > CHALLENGE_TTL_SECONDS) return false;

    const payload = `${expectedAnswer}.${issuedAtText}`;
    const expectedSignature = sign(payload);
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) return false;

    return digestAnswer(answer) === digestAnswer(expectedAnswer);
  } catch {
    return false;
  }
}
