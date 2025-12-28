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
        { budget: "Not enough data to suggest a budget." },
        { status: 400 }
      );
    }

    // Check cache first
    const statsHash = generateStatsHash(stats);
    const cachedResponse = await getCachedResponse(
      user.id,
      "budget",
      statsHash
    );

    if (cachedResponse) {
      return NextResponse.json({ budget: cachedResponse });
    }

    // Fallback if API key missing
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({
        budget: "Could not generate budget suggestions right now.",
      });
    }

    const prompt = `
You are a personal finance coach.

Based on this data:

Income: ₹${stats.income}
Expense: ₹${stats.expense}
Savings: ₹${stats.savings}

Category Breakdown:
${stats.categoryBreakdown
  ?.map((c: any) => `${c.name}: ₹${c.value}`)
  .join("\n") || "N/A"}

Task:
Suggest a realistic monthly budget (in rupees) for the next month.
Focus on 4–7 main categories (e.g. Food, Travel, Bills, Shopping, Entertainment, Others).

Rules:
- Output as bullet points only.
- Each bullet: "<Category>: ₹amount – short justification".
- Total suggested budget must not exceed income.
- Keep it practical, simple, and friendly.
`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: "You help users plan realistic monthly budgets.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.5,
    });

    const budget =
      completion.choices[0].message.content?.trim() ||
      "Could not generate budget suggestions right now.";

    // Cache the response
    if (budget) {
      await saveCachedResponse(user.id, "budget", statsHash, budget);
    }

    return NextResponse.json({ budget });
  } catch (err) {
    console.error("AI BUDGET ERROR:", err);
    return NextResponse.json({
      budget: "Could not generate budget suggestions right now.",
    });
  }
}