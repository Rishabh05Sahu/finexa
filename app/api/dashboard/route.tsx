import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Transaction from "@/models/Transactions";
import { verifyAuth } from "@/lib/verifyAuth";

export async function GET(req: Request) {
  try {
    await connectDB();

    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    const user = verifyAuth(token);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = user.id;

    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // ---------------------------------------
    // THIS MONTH'S TRANSACTIONS
    // ---------------------------------------
    const monthTx = await Transaction.find({
      userId,
      date: { $gte: firstDay, $lte: lastDay },
    });

    const income = monthTx
      .filter((t) => t.type === "income")
      .reduce((acc, t) => acc + t.amount, 0);

    const expense = monthTx
      .filter((t) => t.type === "expense")
      .reduce((acc, t) => acc + t.amount, 0);

    const savings = income - expense;

    // ---------------------------------------
    // RECENT TRANSACTIONS
    // ---------------------------------------
    const recent = await Transaction.find({ userId })
      .sort({ createdAt: -1 })
      .limit(3);

    // ---------------------------------------
    // CATEGORY BREAKDOWN (PIE CHART)
    // ---------------------------------------
    const categoryBreakdown = await Transaction.aggregate([
      { $match: { userId } },
      { $group: { _id: "$category", total: { $sum: "$amount" } } },
      { $project: { name: "$_id", value: "$total", _id: 0 } },
    ]);

    // ---------------------------------------
    // MONTHLY TREND (LINE CHART)
    // ---------------------------------------
    const monthlyTrend = await Transaction.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: { month: { $month: "$date" }, year: { $year: "$date" } },
          expense: {
            $sum: {
              $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0],
            },
          },
        },
      },
      {
        $project: {
          name: {
            $concat: [
              { $toString: "$_id.month" },
              "/",
              { $toString: "$_id.year" },
            ],
          },
          expense: 1,
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    // ---------------------------------------
    // MONTH-OVER-MONTH COMPARISON
    // ---------------------------------------

    // Last month boundaries
    const firstDayLastMonth = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1
    );
    const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // This Month Expense Only
    const thisMonthExpenses = await Transaction.find({
      userId,
      type: "expense",
      date: { $gte: firstDay, $lte: lastDay },
    });
    const thisMonthTotal = thisMonthExpenses.reduce(
      (sum, t) => sum + t.amount,
      0
    );

    // Last Month Expense Only
    const lastMonthExpenses = await Transaction.find({
      userId,
      type: "expense",
      date: { $gte: firstDayLastMonth, $lte: lastDayLastMonth },
    });
    const lastMonthTotal = lastMonthExpenses.reduce(
      (sum, t) => sum + t.amount,
      0
    );

    const monthDifference = thisMonthTotal - lastMonthTotal;

    // ---------------------------------------
    // FINAL RESPONSE
    // ---------------------------------------
    return NextResponse.json(
      {
        income,
        expense,
        savings,
        recent,
        categoryBreakdown,
        monthlyTrend,

        // ✓ NEW dynamic section
        monthComparison: {
          thisMonth: thisMonthTotal,
          lastMonth: lastMonthTotal,
          difference: monthDifference,
        },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Dashboard Error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
