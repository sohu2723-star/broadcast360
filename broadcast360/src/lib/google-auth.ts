import { OAuth2Client } from "google-auth-library";

import { assertGmailAddress, getGoogleClientId } from "@/lib/auth-policy";

const googleClient = new OAuth2Client();

export type GoogleIdentity = {
  googleId: string;
  email: string;
  name: string;
  avatar?: string;
};

export async function verifyGoogleCredential(
  credential: unknown,
): Promise<GoogleIdentity> {
  if (typeof credential !== "string" || credential.length < 100) {
    throw new Error("Invalid Google credential");
  }

  const ticket = await googleClient.verifyIdToken({
    idToken: credential,
    audience: getGoogleClientId(),
  });
  const payload = ticket.getPayload();

  if (!payload?.sub || !payload.email || payload.email_verified !== true) {
    throw new Error("Google email is not verified");
  }

  const email = assertGmailAddress(payload.email);

  return {
    googleId: payload.sub,
    email,
    name: payload.name?.trim() || email.split("@")[0],
    avatar: payload.picture,
  };
}
