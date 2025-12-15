import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { connectDB } from "@/lib/db";
import Transaction from "@/models/Transactions";
import ChatMessage from "@/models/ChatMessage";
import { verifyAuth } from "@/lib/verifyAuth";

type ChatMessageType = {
  role: "user" | "assistant";
  content: string;
};

export async function POST(req: Request) {
  try {
    await connectDB();

    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    const user = verifyAuth(token);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = user.id;

    const body = await req.json();
    const messages: ChatMessageType[] = body.messages || [];

    const lastMessage = messages[messages.length - 1];
    const userInput = lastMessage?.content || "";

    // ✅ Use a single default sessionId for all messages (just use userId as sessionId)
    const defaultSessionId = userId;

    // ---------------- SAVE USER MESSAGE ----------------
    await ChatMessage.create({
      userId,
      sessionId: defaultSessionId, // ✅ Use userId as the default session
      role: "user",
      content: userInput,
    });

    // ---------- Pull financial data ----------
    const now = new Date();
    const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayThisMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const thisMonthTx = await Transaction.find({
      userId,
      date: { $gte: firstDayThisMonth, $lte: lastDayThisMonth },
    });

    const allTx = await Transaction.find({ userId })
      .sort({ date: -1 })
      .limit(200);

    const incomeThisMonth = thisMonthTx
      .filter((t: any) => t.type === "income")
      .reduce((sum: number, t: any) => sum + t.amount, 0);

    const expenseThisMonth = thisMonthTx
      .filter((t: any) => t.type === "expense")
      .reduce((sum: number, t: any) => sum + t.amount, 0);

    const savingsThisMonth = incomeThisMonth - expenseThisMonth;

    // Category totals
    const categoryMap: Record<string, number> = {};
    allTx.forEach((t: any) => {
      if (!categoryMap[t.category]) categoryMap[t.category] = 0;
      if (t.type === "expense") categoryMap[t.category] += t.amount;
    });

    const categorySummary = Object.entries(categoryMap).map(([name, value]) => ({
      name,
      value,
    }));

    // Recent transactions summary
    const recentTxText = allTx
      .slice(0, 20)
      .map(
        (t: any) =>
          `${new Date(t.date).toISOString().slice(0, 10)} - ${
            t.type
          } - ${t.category} - ₹${t.amount} - ${t.description || ""}`
      )
      .join("\n");

    // ---------- CHAT HISTORY (all user's messages) ----------
    const chatHistory = await ChatMessage.find({ userId }).sort({
      createdAt: 1,
    }).limit(50); // ✅ Get last 50 messages for context

    const historyText = chatHistory
      .map(
        (m: any) =>
          `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`
      )
      .join("\n");

    // ---------- LLM Prompt ----------
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-lite",
    });

    const prompt = `
You are a friendly personal finance assistant.

User's financial data:
- Income this month: ₹${incomeThisMonth}
- Expense this month: ₹${expenseThisMonth}
- Savings this month: ₹${savingsThisMonth}

Category totals:
${categorySummary
  .map((c) => `- ${c.name}: ₹${c.value.toFixed(2)}`)
  .join("\n")}

Recent transactions:
${recentTxText}

Conversation so far:
${historyText}

Instructions:
- Respond based only on this data.
- If the user asks something unrelated, say you don't have data.
- Use emojis.
- Keep answers short (2–4 sentences).
`;

    const result = await model.generateContent(prompt);
    const reply = result.response.text().trim();

    // ---------------- SAVE AI MESSAGE ----------------
    await ChatMessage.create({
      userId,
      sessionId: defaultSessionId,
      role: "assistant",
      content: reply,
    });

    return NextResponse.json({ reply }, { status: 200 });
  } catch (err) {
    console.error("AI CHAT ERROR:", err);
    return NextResponse.json(
      { reply: "Sorry, I couldn't process that right now." },
      { status: 500 }
    );
  }
}
