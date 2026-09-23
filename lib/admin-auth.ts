import { SignJWT, jwtVerify } from "jose";

const COOKIE_NAME = "rahat_admin_session";

function getSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;

  if (!secret) {
    throw new Error(
      "ADMIN_SESSION_SECRET is not configured.",
    );
  }

  return new TextEncoder().encode(secret);
}

export async function createAdminSession() {
  return await new SignJWT({
    role: "admin",
  })
    .setProtectedHeader({
      alg: "HS256",
    })
    .setIssuedAt()
    .setExpirationTime("12h")
    .sign(getSecret());
}

export async function verifyAdminSession(
  token: string | undefined,
) {
  if (!token) {
    return false;
  }

  try {
    const { payload } = await jwtVerify(
      token,
      getSecret(),
    );

    return payload.role === "admin";
  } catch {
    return false;
  }
}

export function getAdminCookieName() {
  return COOKIE_NAME;
}

export function getAdminCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 12,
  };
}