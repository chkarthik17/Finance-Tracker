import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const SECURITY_CODE = "0823";
const SESSION_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (code === SECURITY_CODE) {
      const expiresAt = Date.now() + SESSION_DURATION;

      const response = NextResponse.json({ success: true });

      // Set secure HTTP-only cookie
      response.cookies.set("auth_session", String(expiresAt), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: SESSION_DURATION / 1000,
        path: "/",
      });

      return response;
    }

    return NextResponse.json(
      { error: "Invalid security code" },
      { status: 401 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
