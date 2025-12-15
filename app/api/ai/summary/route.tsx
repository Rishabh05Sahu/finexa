import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  try {
    const { stats } = await req.json();

    if (!stats) {
      return NextResponse.json(
        { error: "Stats not provided" },
        { status: 400 }
      );
    }

    // Check if API key exists
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({
        summary: `💰 Your income this month is ₹${stats.income || 0}, expenses are ₹${stats.expense || 0}, and savings are ₹${stats.savings || 0}. Keep tracking your spending!`
      });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

    const prompt = `
You are a financial advisor. Analyze this month's financial stats:

Income: ₹${stats.income}
Expense: ₹${stats.expense}
Savings: ₹${stats.savings}

Category Breakdown (Top categories only):
${JSON.stringify(stats.categoryBreakdown.slice(0, 5))}


Write a short 2–3 line summary. Be simple, encouraging, and insightful and you can use emojis also:
Return ONLY the summary. No titles or formatting.
    `;

    const result = await model.generateContent(prompt);
    const text = await result.response.text();

    return NextResponse.json({ summary: text.trim() });
  } catch (err: any) {
    console.error("AI summary error:", err);
    
    // Handle quota exceeded or rate limit errors
    if (err?.status === 429 || err?.message?.includes("quota") || err?.message?.includes("rate")) {
      const { stats } = await req.json().catch(() => ({ stats: null }));
      
      // Generate a simple fallback summary
      const fallbackSummary = generateFallbackSummary(stats);
      
      return NextResponse.json({
        summary: fallbackSummary
      });
    }

    // For other errors, return a generic message
    return NextResponse.json({
      summary: "Could not generate summary right now."
    });
  }
}

// Fallback function to generate summary when API quota is exceeded
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
