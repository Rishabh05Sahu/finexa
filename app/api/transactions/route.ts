import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Transaction from "@/models/Transactions";
import { verifyAuth } from "@/lib/verifyAuth";

export async function GET(req: Request) {
  try {
    await connectDB();

    const accessToken = req.headers
      .get("authorization")
      ?.replace("Bearer ", "");

    const user = verifyAuth(accessToken);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch only the user's transactions
    const transactions = await Transaction.find({ userId: user.id }).sort({
      createdAt: -1,
    });

    return NextResponse.json(transactions, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();

    // read access token from headers
    const accessToken = req.headers
      .get("authorization")
      ?.replace("Bearer ", "");
    const user = await verifyAuth(accessToken);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const newTransaction = await Transaction.create({
      ...body,
      userId: user.id,
    });

    return NextResponse.json(newTransaction, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}


