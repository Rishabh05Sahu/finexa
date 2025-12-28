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
        { error: "Stats not provided" },
        { status: 400 }
      );
    }

    // Generate hash of stats to detect changes
    const statsHash = generateStatsHash(stats);
    
    // Check cache first
    const cachedResponse = await getCachedResponse(
      user.id,
      "summary",
      statsHash
    );

    // Return cached response if available
    if (cachedResponse) {
      return NextResponse.json({ summary: cachedResponse });
    }

    // If Groq key missing → fallback summary
    if (!process.env.GROQ_API_KEY) {
      const fallback = generateFallbackSummary(stats);
      await saveCachedResponse(user.id, "summary", statsHash, fallback);
      return NextResponse.json({ summary: fallback });
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

    const text = completion.choices[0].message.content?.trim() || "";

    // Cache the response before returning
    if (text) {
      await saveCachedResponse(user.id, "summary", statsHash, text);
    }

    return NextResponse.json({ summary: text });
  } catch (err: any) {
    console.error("AI summary error:", err);

    // Rate limit / quota fallback
    if (
      err?.status === 429 ||
      err?.message?.includes("rate") ||
      err?.message?.includes("limit")
    ) {
      try {
        const token = req.headers.get("authorization")?.replace("Bearer ", "");
        const user = verifyAuth(token);
        const reqClone = req.clone();
        const { stats } = await reqClone.json().catch(() => ({ stats: null }));

        if (user && stats) {
          const statsHash = generateStatsHash(stats);
          const fallback = generateFallbackSummary(stats);
          await saveCachedResponse(user.id, "summary", statsHash, fallback);
          return NextResponse.json({ summary: fallback });
        }
      } catch (e) {
        // Ignore
      }
    }

    return NextResponse.json({
      summary: "Could not generate summary right now.",
    });
  }
}

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