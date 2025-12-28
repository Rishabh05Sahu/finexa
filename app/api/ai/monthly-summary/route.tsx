export const runtime = "nodejs";

import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { stats } = await req.json();

    if (!stats) {
      return NextResponse.json(
        { summary: "Not enough data." },
        { status: 400 }
      );
    }

    // Fallback if key missing
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({
        summary: "Unable to generate monthly summary right now.",
      });
    }

    const prompt = `
You are a financial assistant.

Generate exactly 3 concise bullet points summarizing the user’s monthly spending.

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
      temperature: 0.3, // 🔑 controlled creativity
    });

    const summary =
      completion.choices[0].message.content?.trim() ||
      "Unable to generate monthly summary right now.";

    return NextResponse.json({ summary });
  } catch (err) {
    console.error("MONTHLY SUMMARY AI ERROR:", err);
    return NextResponse.json({
      summary: "Unable to generate monthly summary right now.",
    });
  }
}
