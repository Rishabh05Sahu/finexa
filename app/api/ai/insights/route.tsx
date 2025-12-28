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
        { insights: "No stats provided." },
        { status: 400 }
      );
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
      temperature: 0.6, // balanced insight + consistency
    });

    const insights =
      completion.choices[0].message.content?.trim() ||
      "AI could not generate insights right now.";

    return NextResponse.json({ insights });
  } catch (err) {
    console.error("AI INSIGHTS ERROR:", err);
    return NextResponse.json({
      insights: "AI could not generate insights right now.",
    });
  }
}
