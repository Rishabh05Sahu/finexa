export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Transaction from "@/models/Transactions";
import ChatMessage from "@/models/ChatMessage";
import { verifyAuth } from "@/lib/verifyAuth";
import Groq from "groq-sdk";

type ChatMessageType = {
  role: "user" | "assistant";
  content: string;
};

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

export async function POST(req: Request) {
  try {
    await connectDB();

    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    const user = verifyAuth(token);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = user.id;
    const defaultSessionId = userId;

    const body = await req.json();
    const messages: ChatMessageType[] = body.messages || [];
    const lastMessage = messages[messages.length - 1];
    const userInput = lastMessage?.content || "";

    // ---------------- SAVE USER MESSAGE ----------------
    await ChatMessage.create({
      userId,
      sessionId: defaultSessionId,
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
      if (t.type === "expense") {
        categoryMap[t.category] =
          (categoryMap[t.category] || 0) + t.amount;
      }
    });

    const categorySummary = Object.entries(categoryMap).map(([name, value]) => ({
      name,
      value,
    }));

    // Recent transactions
    const recentTxText = allTx
      .slice(0, 20)
      .map(
        (t: any) =>
          `${new Date(t.date).toISOString().slice(0, 10)} - ${t.type} - ${
            t.category
          } - ₹${t.amount} - ${t.description || ""}`
      )
      .join("\n");

    // ---------- Chat history ----------
    const chatHistory = await ChatMessage.find({ userId })
      .sort({ createdAt: 1 })
      .limit(50);

    const historyText = chatHistory
      .map(
        (m: any) =>
          `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`
      )
      .join("\n");

    // ---------- Prompt ----------
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
- Respond ONLY using the data above.
- If the user asks something unrelated, say you don’t have enough data.
- Use emojis.
- Keep replies short (2–4 sentences).
`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content:
            "You are a concise, friendly personal finance assistant.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.6,
    });

    const reply =
      completion.choices[0].message.content?.trim() ||
      "Sorry, I couldn't process that right now.";

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
