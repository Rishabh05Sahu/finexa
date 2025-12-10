import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
import { verifyAuth } from "@/lib/verifyAuth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    await connectDB();

    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    const user = verifyAuth(token);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Convert file → buffer → base64
    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;

    // Upload to Cloudinary
    const uploadRes = await cloudinary.uploader.upload(base64, {
      folder: "finance-app-profiles",
    });

    // Save to DB
    await User.findByIdAndUpdate(user.id, {
      profileImage: uploadRes.secure_url,
    });

    return NextResponse.json(
      { url: uploadRes.secure_url },
      { status: 200 }
    );
  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}
