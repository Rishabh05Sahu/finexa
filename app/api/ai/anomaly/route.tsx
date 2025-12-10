import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Transaction from "@/models/Transactions";
import { verifyAuth } from "@/lib/verifyAuth";

export async function POST(req: Request) {
  try {
    await connectDB();

    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    const user = verifyAuth(token);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = user.id;
    const transactions = await Transaction.find({ userId }).sort({ date: 1 });

    if (!transactions.length) {
      return NextResponse.json({ anomalies: [] });
    }

    // Group expenses per day
    const dayMap: any = {};

    transactions.forEach((t: any) => {
      const day = new Date(t.date).toISOString().slice(0, 10);

      if (!dayMap[day]) dayMap[day] = 0;
      if (t.type === "expense") dayMap[day] += t.amount;
    });

    const dailyValues = Object.values(dayMap);
    const avg =
  (dailyValues as number[]).reduce((a, b) => a + b, 0) / dailyValues.length;

    // Flag days where spending > 2 × Average
    const anomalies = Object.entries(dayMap)
      .filter(([day, amount]: any) => amount > avg * 2)
      .map(([day, amount]: any) => ({
        day,
        amount,
        message: `Your spending on ${day} was unusually high (₹${amount}), which is more than 2× your average daily spending.`,
      }));

    return NextResponse.json({ anomalies });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
