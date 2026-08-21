import { createRemoteJWKSet, jwtVerify } from "jose";

import { assertGmailAddress, getGoogleClientId } from "@/lib/auth-policy";

const GOOGLE_JWKS = createRemoteJWKSet(new URL("https://www.googleapis.com/oauth2/v3/certs"));
const GOOGLE_ISSUERS = ["https://accounts.google.com", "accounts.google.com"];

type GoogleTokenClaims = {
  sub?: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
};

export type GoogleIdentity = {
  googleId: string;
  email: string;
  name: string;
  avatar?: string;
};

export async function verifyGoogleCredential(credential: unknown): Promise<GoogleIdentity> {
  if (typeof credential !== "string" || credential.length < 100) {
    throw new Error("Invalid Google credential");
  }

  const { payload } = await jwtVerify(credential, GOOGLE_JWKS, {
    issuer: GOOGLE_ISSUERS,
    audience: getGoogleClientId(),
  });
  const claims = payload as GoogleTokenClaims;

  if (!claims.sub || !claims.email || claims.email_verified !== true) {
    throw new Error("Google email is not verified");
  }

  const email = assertGmailAddress(claims.email);
  return {
    googleId: claims.sub,
    email,
    name: claims.name?.trim() || email.split("@")[0],
    avatar: claims.picture,
  };
}
