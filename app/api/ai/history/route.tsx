import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import ChatMessage from "@/models/ChatMessage";
import { verifyAuth } from "@/lib/verifyAuth";

export async function GET(req: Request) {
  try {
    await connectDB();

    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    const user = verifyAuth(token);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = user.id;

    // ✅ Get all messages for this user (no session filtering)
    const messages = await ChatMessage.find({ userId })
      .sort({ createdAt: 1 }) // oldest → newest
      .limit(200); // Get last 200 messages

    // ✅ Format messages properly
    const formattedMessages = messages.map((msg: any) => ({
      role: msg.role,
      content: msg.content,
    }));

    return NextResponse.json({ messages: formattedMessages }, { status: 200 });
  } catch (err) {
    console.error("Chat history error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
