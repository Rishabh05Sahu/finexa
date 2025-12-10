import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Transaction from "@/models/Transactions";
import { verifyAuth } from "@/lib/verifyAuth";
import mongoose from "mongoose";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;


    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    const user = verifyAuth(token);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const deleted = await Transaction.findOneAndDelete({
      _id: id, // ✅ Use the awaited id
      userId: user.id,
    });

    if (!deleted) {
      return NextResponse.json({ error: "Not Found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Transaction deleted" },
      { status: 200 }
    );
  } catch (e) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}


export async function PUT(
  req: Request, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    // ✅ Await params to get the id
    const { id } = await params;

    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    const user = verifyAuth(token);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const updated = await Transaction.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(id), // ✅ Use the awaited id
        userId: user.id,
      },
      body,
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(updated, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}