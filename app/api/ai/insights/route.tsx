export const runtime = "nodejs";

import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { connectDB } from "@/lib/db";
import { verifyAuth } from "@/lib/verifyAuth";
import {
  getCachedResponse,
  saveCachedResponse,
  generateStatsHash,
} from "@/lib/aiCache";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

export async function POST(req: Request) {
  try {
    await connectDB();

    // Get user from token
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    const user = verifyAuth(token);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { stats } = await req.json();

    if (!stats) {
      return NextResponse.json(
        { insights: "No stats provided." },
        { status: 400 }
      );
    }

    // Check cache first
    const statsHash = generateStatsHash(stats);
    const cachedResponse = await getCachedResponse(
      user.id,
      "insights",
      statsHash
    );

    if (cachedResponse) {
      return NextResponse.json({ insights: cachedResponse });
    }

    // Fallback if key missing
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({
        insights: "AI could not generate insights right now.",
      });
    }

    const prompt = `
You are a friendly financial assistant.
Create a short monthly insight report for this user.

Data:
Income: ₹${stats.income}
Expense: ₹${stats.expense}
Savings: ₹${stats.savings}

Top Categories:
${stats.categoryBreakdown
  ?.slice(0, 5)
  .map((c: any) => `${c.name}: ₹${c.value}`)
  .join("\n") || "N/A"}

Monthly Trend (month: expense):
${stats.monthlyTrend
  ?.map((m: any) => `${m.name}: ₹${m.expense}`)
  .join("\n") || "N/A"}

Write 3–5 short sentences:
- Mention overall spending and savings.
- Call out 1–2 big categories.
- Suggest 1–2 small, realistic improvements.
Keep it simple and encouraging.
`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: "You generate friendly, concise financial insights.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.6,
    });

    const insights =
      completion.choices[0].message.content?.trim() ||
      "AI could not generate insights right now.";

    // Cache the response
    if (insights) {
      await saveCachedResponse(user.id, "insights", statsHash, insights);
    }

    return NextResponse.json({ insights });
  } catch (err) {
    console.error("AI INSIGHTS ERROR:", err);
    return NextResponse.json({
      insights: "AI could not generate insights right now.",
    });
  }
}