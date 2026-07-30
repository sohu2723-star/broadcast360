import { SignJWT, jwtVerify, JWTPayload } from "jose";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET_USER
);

export interface UserTokenPayload extends JWTPayload {
  id: number;
  email: string;
  role: "USER";
}


export async function createUserToken(payload: {
  id: number;
  email: string;
  role: "USER";
}): Promise<string> {

  return await new SignJWT(payload)
    .setProtectedHeader({
      alg: "HS256",
    })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);

}


export async function verifyUserToken(
  token: string,
): Promise<UserTokenPayload> {

  const { payload } = await jwtVerify(
    token,
    secret
  );

  return payload as UserTokenPayload;

}