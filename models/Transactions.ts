import { Schema, model, models } from "mongoose";

const TransactionSchema = new Schema({
  userId: { type: String, required: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ["income", "expense"], required: true },
  category: { type: String, required: true },
  description: { type: String },
  date: { type: Date, default: Date.now },
}, { timestamps: true });

export default models.Transaction || model("Transaction", TransactionSchema);
