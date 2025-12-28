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
        { error: "Stats not provided" },
        { status: 400 }
      );
    }

    // If Groq key missing → fallback summary
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({
        summary: generateFallbackSummary(stats),
      });
    }

    const prompt = `
You are a financial advisor.

Analyze this month's financial stats:

Income: ₹${stats.income}
Expense: ₹${stats.expense}
Savings: ₹${stats.savings}

Category Breakdown (Top categories only):
${JSON.stringify(stats.categoryBreakdown?.slice(0, 5) || [])}

Write a short 2–3 line summary.
Be simple, encouraging, and insightful.
You may use emojis.
Return ONLY the summary text.
`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: "You are a helpful financial assistant.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
    });

    const text = completion.choices[0].message.content;

    return NextResponse.json({ summary: text?.trim() });
  } catch (err: any) {
    console.error("AI summary error:", err);

    // Rate limit / quota fallback
    if (
      err?.status === 429 ||
      err?.message?.includes("rate") ||
      err?.message?.includes("limit")
    ) {
      const { stats } = await req.json().catch(() => ({ stats: null }));

      return NextResponse.json({
        summary: generateFallbackSummary(stats),
      });
    }

    return NextResponse.json({
      summary: "Could not generate summary right now.",
    });
  }
}

// ===============================
// Fallback summary (UNCHANGED)
// ===============================
function generateFallbackSummary(stats: any) {
  if (!stats) {
    return "📊 Track your expenses to see insights here!";
  }

  const income = stats.income || 0;
  const expense = stats.expense || 0;
  const savings = stats.savings || 0;
  const topCategory = stats.categoryBreakdown?.[0];

  let summary = "";

  if (savings > 0) {
    summary = `💰 Great job! You saved ₹${savings} this month. `;
  } else if (savings < 0) {
    summary = `⚠️ You spent ₹${Math.abs(savings)} more than you earned. `;
  } else {
    summary = `📊 Your income and expenses are balanced this month. `;
  }

  if (topCategory) {
    summary += `Your top spending category is ${topCategory.name} (₹${topCategory.value}).`;
  } else {
    summary += "Keep tracking your expenses to see category insights!";
  }

  return summary;
}
