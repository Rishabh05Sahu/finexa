"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { useAuthStore } from "@/store/useAuthStore";
import { Loader2 } from "lucide-react";

export default function EditTransactionForm({ data, onClose, onUpdated }: any) {
  const accessToken = useAuthStore((s: any) => s.accessToken);

  const [form, setForm] = useState({
    amount: data.amount,
    type: data.type,
    category: data.category,
    description: data.description,
  });

  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    setLoading(true);

    const res = await fetch(`/api/transactions/${data._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(form),
    });

    const updated = await res.json();
    setLoading(false);

    if (res.ok) {
      onUpdated(updated);
      onClose();
    }
  };

  return (
    <div className="space-y-4">
      <Input
        type="number"
        value={form.amount}
        onChange={(e) => setForm({ ...form, amount: e.target.value })}
      />

      <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
        <SelectTrigger>
          <SelectValue placeholder="Select type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="income">Income</SelectItem>
          <SelectItem value="expense">Expense</SelectItem>
        </SelectContent>
      </Select>

      <Input
        value={form.category}
        onChange={(e) => setForm({ ...form, category: e.target.value })}
        placeholder="Category"
      />

      <Textarea
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        placeholder="Description"
      />

      <Button className="w-full" onClick={handleUpdate} disabled={loading}>
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Update Transaction"}
      </Button>
    </div>
  );
}
