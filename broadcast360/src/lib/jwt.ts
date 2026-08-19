import { jwtVerify, SignJWT, type JWTPayload } from "jose";

export interface TokenPayload extends JWTPayload {
  id: number;
  email: string;
  role: "ADMIN" | "USER";
}

function getSecret() {
  const secretKey = process.env.JWT_SECRET;
  if (!secretKey || secretKey.length < 32) {
    throw new Error("JWT_SECRET must be set and at least 32 characters long");
  }
  return new TextEncoder().encode(secretKey);
}

export async function createToken(payload: {
  id: number;
  email: string;
  role: "ADMIN" | "USER";
}): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
}

export async function verifyToken(token: string): Promise<TokenPayload> {
  const { payload } = await jwtVerify(token, getSecret(), {
    algorithms: ["HS256"],
  });

  return payload as TokenPayload;
}
