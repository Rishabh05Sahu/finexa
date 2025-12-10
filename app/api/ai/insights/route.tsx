import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  try {
    const { stats } = await req.json();

    if (!stats) {
      return NextResponse.json(
        { insights: "No stats provided." },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

    const prompt = `
You are a friendly financial assistant.
Create a short monthly insight report for this user.

Data:
Income: ₹${stats.income}
Expense: ₹${stats.expense}
Savings: ₹${stats.savings}

Top Categories:
${stats.categoryBreakdown
  .slice(0, 5)
  .map((c: any) => `${c.name}: ₹${c.value}`)
  .join("\n")}

Monthly Trend (month: expense):
${stats.monthlyTrend.map((m: any) => `${m.name}: ₹${m.expense}`).join("\n")}

Write 3–5 short sentences:
- Mention their overall spending & savings.
- Call out 1–2 big categories.
- Suggest 1–2 small, realistic improvements.
Keep it simple and encouraging.
    `;

    const result = await model.generateContent(prompt);
    const insights = result.response.text().trim();

    return NextResponse.json({ insights });
  } catch (err) {
    console.error("AI INSIGHTS ERROR:", err);
    return NextResponse.json({
      insights: "AI could not generate insights right now.",
    });
  }
}
