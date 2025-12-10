import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  try {
    const { stats } = await req.json();

    if (!stats) {
      return NextResponse.json(
        { budget: "Not enough data to suggest a budget." },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

    const prompt = `
You are a personal finance coach.

Based on this data:

Income: ₹${stats.income}
Expense: ₹${stats.expense}
Savings: ₹${stats.savings}

Category Breakdown:
${stats.categoryBreakdown
  .map((c: any) => `${c.name}: ₹${c.value}`)
  .join("\n")}

Task:
Suggest a realistic monthly budget (in rupees) for the next month.
Focus on 4–7 main categories, e.g. Food, Travel, Bills, Shopping, Entertainment, Others.

Rules:
- Output as bullet points.
- Each bullet: "<Category>: ₹amount – short justification".
- Keep it practical (don’t make totals exceed income).
- Keep language simple and friendly.
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    return NextResponse.json({ budget: text });
  } catch (err) {
    console.error("AI BUDGET ERROR:", err);
    return NextResponse.json({
      budget: "Could not generate budget suggestions right now.",
    });
  }
}
