"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useAuthStore } from "@/store/useAuthStore";

import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Sparkles, Loader2 } from "lucide-react";

export default function AddTransactionForm() {
  const accessToken = useAuthStore((s: any) => s.accessToken);
  const [form, setForm] = useState({
    amount: "",
    type: "expense",
    category: "",
    description: "",
  });

  const [loadingAI, setLoadingAI] = useState(false);

  const handleCategoryAI = async () => {
    try {
      setLoadingAI(true);
      const res = await fetch("/api/ai/categorize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: form.description }),
      });

      const data = await res.json();
      if (data.category) {
        setForm((prev) => ({ ...prev, category: data.category }));
      }
    } finally {
      setLoadingAI(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        toast.error("Failed to add transaction");
        return;
      }

      toast.success("Transaction added!");

      // clears the form
      setForm({
        amount: "",
        type: "expense",
        category: "",
        description: "",
      });

      // optional: close modal if parent passed close fn
      if (typeof (window as any).closeAddModal === "function") {
        (window as any).closeAddModal();
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  return (
    <Card className="shadow-sm p-2">
      <CardHeader>
        <CardTitle>Add Transaction</CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Amount */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Amount (₹)</label>
          <Input
            type="number"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            placeholder="Enter amount"
          />
        </div>

        {/* Type */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Type</label>
          <Select
            value={form.type}
            onValueChange={(v) => setForm({ ...form, type: v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="expense">Expense</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Description</label>
          <Textarea
            placeholder="E.g. Bought groceries, Starbucks coffee, Electricity bill"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>

        {/* Category + AI Suggest */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Category</label>

            <Button
              variant="outline"
              size="sm"
              onClick={handleCategoryAI}
              disabled={loadingAI || !form.description}
              className="flex items-center gap-1"
            >
              {loadingAI ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 text-purple-600" />
              )}
              AI Suggest
            </Button>
          </div>

          <Input
            placeholder="Enter or use AI suggestion"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          />
        </div>

        <Button className="w-full py-3 text-md" onClick={handleSubmit}>
          Add Transaction
        </Button>
      </CardContent>
    </Card>
  );
}
