import { NextResponse } from "next/server";
import crypto from "crypto";
import {
  createAdminSession,
  getAdminCookieName,
  getAdminCookieOptions,
} from "@/lib/admin-auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const password =
      typeof body.password === "string"
        ? body.password
        : "";

    const adminPassword =
      process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      console.error("ADMIN_PASSWORD is not configured.");

      return NextResponse.json(
        {
          error: "Admin authentication is not configured.",
        },
        { status: 500 },
      );
    }

    const passwordBuffer = Buffer.from(password);
    const expectedBuffer = Buffer.from(adminPassword);

    const valid =
      passwordBuffer.length === expectedBuffer.length &&
      crypto.timingSafeEqual(
        passwordBuffer,
        expectedBuffer,
      );

    if (!valid) {
      return NextResponse.json(
        {
          error: "Invalid password.",
        },
        { status: 401 },
      );
    }

    const token = await createAdminSession();

    const response = NextResponse.json({
      success: true,
    });

    response.cookies.set(
      getAdminCookieName(),
      token,
      getAdminCookieOptions(),
    );

    return response;
  } catch (error) {
    console.error("Admin login error:", error);

    return NextResponse.json(
      {
        error: "Unable to sign in.",
      },
      { status: 500 },
    );
  }
}