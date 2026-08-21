const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

type TurnstileResponse = {
  success: boolean;
  "error-codes"?: string[];
};

export async function verifyTurnstileToken(token: unknown, request?: Request) {
  if (typeof token !== "string" || token.length < 1) return false;

  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    // Local development can run without a production secret only when explicitly
    // enabled with TURNSTILE_ALLOW_LOCAL_BYPASS=true. Production never bypasses.
    return process.env.NODE_ENV !== "production" && process.env.TURNSTILE_ALLOW_LOCAL_BYPASS === "true";
  }

  const form = new URLSearchParams({
    secret,
    response: token,
  });
  const remoteIp = request?.headers.get("CF-Connecting-IP") ?? request?.headers.get("x-forwarded-for");
  if (remoteIp) form.set("remoteip", remoteIp.split(",")[0].trim());

  try {
    const response = await fetch(TURNSTILE_VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form,
      cache: "no-store",
    });
    if (!response.ok) return false;
    const result = (await response.json()) as TurnstileResponse;
    return result.success === true;
  } catch {
    return false;
  }
}
