import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  try {
    const { stats } = await req.json();

    if (!stats) {
      return NextResponse.json(
        { summary: "Not enough data." },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

    const prompt = `
You are a financial assistant. 
Generate exactly **3 concise bullet points** summarizing the user’s monthly spending.

Use this data:
Income: ₹${stats.income}
Expense: ₹${stats.expense}
Savings: ₹${stats.savings}

Category Breakdown:
${stats.categoryBreakdown
  .map((c: any) => `${c.name}: ₹${c.value}`)
  .join("\n")}

Monthly Trend:
${stats.monthlyTrend
  .map((m: any) => `${m.name}: ₹${m.expense}`)
  .join("\n")}

Rules:
- Return only bullet points (no title, no intro).
- Keep each bullet under 18 words.
- Mention high-spend category, increase/decrease, or meaningful patterns.
`;

    const result = await model.generateContent(prompt);
    const summary = result.response.text().trim();

    return NextResponse.json({ summary });
  } catch (err) {
    console.error("MONTHLY SUMMARY AI ERROR:", err);
    return NextResponse.json({
      summary: "Unable to generate monthly summary right now.",
    });
  }
}
