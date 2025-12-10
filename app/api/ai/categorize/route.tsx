import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  try {
    const { description } = await req.json();

    if (!description) {
      return NextResponse.json(
        { error: "No description provided" },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

    const prompt = `
You are an AI that classifies financial transactions into one of the following categories:

["Food", "Travel", "Bills", "Shopping", "Entertainment", "Groceries", "Health", "Salary", "Investment", "Rent", "Other"]

Your job is to interpret short or vague descriptions and map them to the most likely real-world category.

Guidelines:
- Treat items like "coffee", "cafe", "starbucks", "tea", "snacks" as **Food**.
- Treat "restaurant", "dining", "lunch", "breakfast", "dinner", "food delivery" as **Food**.
- Treat "uber", "ola", "taxi", "bus", "train", "flight", "fuel", "gas" as **Travel**.
- Treat subscriptions like "netflix", "spotify", "youtube", "prime" as **Entertainment**.
- Treat supermarkets like "walmart", "target", "big bazaar" as **Groceries** (unless clearly shopping items).
- Treat clothes, electronics, or Amazon orders as **Shopping** unless the description clearly indicates groceries.
- Treat "doctor", "medicine", "pharmacy", "hospital" as **Health**.
- Treat "rent", "house", "room" as **Rent**.
- Treat "salary", "payroll", "credited" as **Salary**.
- Treat "sip", "mutual fund", "shares", "stock" as **Investment**.
- Use **Bills** for utilities: electricity, water, wifi, phone recharge.
- Use **Other** ONLY if absolutely no reasonable category fits.

Description: "${description}"

Return ONLY the category name, nothing else.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response.text();

    // clean category (remove quotes/newline)
    const category = response.replace(/["\n]/g, "").trim();

    return NextResponse.json({ category }, { status: 200 });
  } catch (error) {
    console.log("AI error:", error);
    return NextResponse.json({ category: "Other" });
  }
}
