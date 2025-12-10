import { NextResponse } from "next/server";
import { verifyToken, signToken } from "@/lib/jwt";

export async function POST(req: Request) {
  try {
    const refreshToken = req.headers.get("cookie")?.split("=")[1];

    if (!refreshToken) {
      return NextResponse.json({ error: "No refresh token" }, { status: 401 });
    }

    const decoded = verifyToken(refreshToken) as any;

    const newAccessToken = signToken({ id: decoded.id });

    return NextResponse.json({ accessToken: newAccessToken });

  } catch (error) {
    return NextResponse.json({ error: "Invalid refresh token" }, { status: 403 });
  }
}
