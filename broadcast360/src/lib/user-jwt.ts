import { jwtVerify, SignJWT, type JWTPayload } from "jose";

export interface UserTokenPayload extends JWTPayload {
  id: number;
  email: string;
  role: "USER";
}

function getSecret() {
  const secretKey = process.env.JWT_SECRET_USER;
  if (!secretKey || secretKey.length < 32) {
    throw new Error(
      "JWT_SECRET_USER must be set and at least 32 characters long",
    );
  }
  return new TextEncoder().encode(secretKey);
}

export async function createUserToken(payload: {
  id: number;
  email: string;
  role: "USER";
}): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
}

export async function verifyUserToken(
  token: string,
): Promise<UserTokenPayload> {
  const { payload } = await jwtVerify(token, getSecret(), {
    algorithms: ["HS256"],
  });

  return payload as UserTokenPayload;
}
