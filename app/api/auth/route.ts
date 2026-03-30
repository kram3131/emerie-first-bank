import { NextRequest, NextResponse } from "next/server";

const SITE_PASSWORD = "emerie2026";

export async function POST(request: NextRequest) {
  const { password } = await request.json();

  if (password !== SITE_PASSWORD) {
    return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set("efb-auth", "authenticated", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return response;
}
