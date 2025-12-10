import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { verifyAuth } from "@/lib/verifyAuth";

export async function PUT(req: Request) {
  await connectDB();

  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  const user = verifyAuth(token);

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { oldPassword, newPassword } = body;

  const found = await User.findById(user.id);

  const isMatch = await bcrypt.compare(oldPassword, found.password);
  if (!isMatch)
    return NextResponse.json({ error: "Old password incorrect" }, { status: 400 });

  const hashed = await bcrypt.hash(newPassword, 10);

  found.password = hashed;
  await found.save();

  return NextResponse.json({ message: "Password updated" });
}
