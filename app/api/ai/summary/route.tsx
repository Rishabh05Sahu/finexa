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

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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
  } catch (err) {
    console.error("AI summary error:", err);
    return NextResponse.json({
      summary: "Could not generate summary right now."
    });
  }
}
