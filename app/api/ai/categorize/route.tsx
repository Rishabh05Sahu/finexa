export const runtime = "nodejs";

import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { description } = await req.json();

    if (!description) {
      return NextResponse.json(
        { error: "No description provided" },
        { status: 400 }
      );
    }

    // If API key missing → fallback
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ category: "Other" });
    }

    const prompt = `
You are an AI that classifies financial transactions into one of the following categories:

["Food", "Travel", "Bills", "Shopping", "Entertainment", "Groceries", "Health", "Salary", "Investment", "Rent", "Other"]

Your job is to interpret short or vague descriptions and map them to the most likely real-world category.

Guidelines:
- Treat items like "coffee", "cafe", "starbucks", "tea", "snacks" as Food.
- Treat "restaurant", "dining", "lunch", "breakfast", "dinner", "food delivery" as Food.
- Treat "uber", "ola", "taxi", "bus", "train", "flight", "fuel", "gas" as Travel.
- Treat subscriptions like "netflix", "spotify", "youtube", "prime" as Entertainment.
- Treat supermarkets like "walmart", "target", "big bazaar" as Groceries unless clearly shopping items.
- Treat clothes, electronics, or Amazon orders as Shopping unless groceries are explicit.
- Treat "doctor", "medicine", "pharmacy", "hospital" as Health.
- Treat "rent", "house", "room" as Rent.
- Treat "salary", "payroll", "credited" as Salary.
- Treat "sip", "mutual fund", "shares", "stock" as Investment.
- Use Bills for utilities: electricity, water, wifi, phone recharge.
- Use Other ONLY if absolutely no reasonable category fits.

Description: "${description}"

Return ONLY the category name, nothing else.
`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: "You classify financial transactions into categories.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0, // 🔑 ensures deterministic output
    });

    const response = completion.choices[0].message.content || "";

    // Clean category (extra safety)
    const category = response.replace(/["\n]/g, "").trim();

    return NextResponse.json({ category }, { status: 200 });
  } catch (error) {
    console.error("AI error:", error);
    return NextResponse.json({ category: "Other" });
  }
}
