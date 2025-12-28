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

    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    const user = verifyAuth(token);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { stats } = await req.json();

    if (!stats) {
      return NextResponse.json(
        { summary: "Not enough data." },
        { status: 400 }
      );
    }

    // Check cache first
    const statsHash = generateStatsHash(stats);
    const cachedResponse = await getCachedResponse(
      user.id,
      "monthly-summary",
      statsHash
    );

    if (cachedResponse) {
      return NextResponse.json({ summary: cachedResponse });
    }

    // Fallback if key missing
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({
        summary: "Unable to generate monthly summary right now.",
      });
    }

    const prompt = `
You are a financial assistant.

Generate exactly 3 concise bullet points summarizing the user's monthly spending.

Use this data:

Income: ₹${stats.income}
Expense: ₹${stats.expense}
Savings: ₹${stats.savings}

Category Breakdown:
${stats.categoryBreakdown
  ?.map((c: any) => `${c.name}: ₹${c.value}`)
  .join("\n") || "N/A"}

Monthly Trend:
${stats.monthlyTrend
  ?.map((m: any) => `${m.name}: ₹${m.expense}`)
  .join("\n") || "N/A"}

Rules:
- Return only bullet points.
- No title or introduction.
- Exactly 3 bullets.
- Each bullet under 18 words.
- Mention high-spend category, trends, or notable patterns.
`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: "You summarize financial data into concise bullet points.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
    });

    const summary =
      completion.choices[0].message.content?.trim() ||
      "Unable to generate monthly summary right now.";

    // Cache the response
    if (summary) {
      await saveCachedResponse(user.id, "monthly-summary", statsHash, summary);
    }

    return NextResponse.json({ summary });
  } catch (err) {
    console.error("MONTHLY SUMMARY AI ERROR:", err);
    return NextResponse.json({
      summary: "Unable to generate monthly summary right now.",
    });
  }
}