import { SignJWT, jwtVerify, JWTPayload } from "jose";

// const secret = new TextEncoder().encode(process.env.JWT_SECRET);

const secretKey = process.env.JWT_SECRET;

if (!secretKey) {
  throw new Error("JWT_SECRET environment variable is missing in .env!");
}

const secret = new TextEncoder().encode(secretKey);

export interface TokenPayload extends JWTPayload {
  id: number;
  email: string;
  role: "ADMIN" | "USER";
}

export async function createToken(payload: {
  id: number;
  email: string;
  role: "ADMIN" | "USER";
}): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({
      alg: "HS256",
    })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifyToken(token: string): Promise<TokenPayload> {
  const { payload } = await jwtVerify(token, secret);

  return payload as TokenPayload;
}
