import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { verifyAuth } from "@/lib/verifyAuth";

export async function GET(req: Request) {
  await connectDB();

  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  const user = verifyAuth(token);

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const found = await User.findById(user.id).select("-password");

  return NextResponse.json(found);
}

export async function PUT(req: Request) {
  await connectDB();

  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  const user = verifyAuth(token);

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  const updated = await User.findByIdAndUpdate(
    user.id,
    { name: body.name, email: body.email },
    { new: true }
  ).select("-password");

  return NextResponse.json(updated);
}
