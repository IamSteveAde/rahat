import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/admin-auth";

export async function middleware(
  request: NextRequest,
) {
  const { pathname } = request.nextUrl;

  if (
    pathname === "/admin/login" ||
    pathname.startsWith("/api/admin/login")
  ) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin")) {
    const token = request.cookies.get(
      "rahat_admin_session",
    )?.value;

    const authenticated =
      await verifyAdminSession(token);

    if (!authenticated) {
      const loginUrl = new URL(
        "/admin/login",
        request.url,
      );

      return NextResponse.redirect(loginUrl);
    }
  }

  if (
    pathname.startsWith("/api/admin/") &&
    !pathname.startsWith("/api/admin/login")
  ) {
    const token = request.cookies.get(
      "rahat_admin_session",
    )?.value;

    const authenticated =
      await verifyAdminSession(token);

    if (!authenticated) {
      return NextResponse.json(
        {
          error: "Unauthorized.",
        },
        { status: 401 },
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
  ],
};