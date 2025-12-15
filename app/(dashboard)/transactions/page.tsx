"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash } from "lucide-react";
import { Pencil } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { PlusCircle, Filter } from "lucide-react";
import AddTransactionForm from "@/components/molecules/addtransaction";
import EditTransactionForm from "@/components/molecules/edittransaction";
import { useRouter } from "next/navigation";

export default function TransactionsPage() {
  const [search, setSearch] = useState("");
  const router = useRouter();
  const [filterType, setFilterType] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const accessToken = useAuthStore((s: any) => s.accessToken);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState<any>(null);

  // ---------------- FETCH TRANSACTIONS ----------------
  useEffect(() => {
    const fetchTransactions = async () => {
      if (!accessToken) return;

      try {
        const res = await fetch("/api/transactions", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (res.status === 401) {
          useAuthStore.getState().logout();
          router.push("/login");
          return;
        }

        if (!res.ok) return;

        const data = await res.json();
        setTransactions(data);
      } catch (error) {
        console.log("Error:", error);
      }
    };

    fetchTransactions();
  }, [accessToken]);

  // ---------------- FILTER LOGIC ----------------
  const filteredTransactions = transactions.filter((t: any) => {
    const matchesSearch =
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase());

    const matchesType = filterType === "all" ? true : t.type === filterType;

    return matchesSearch && matchesType;
  });

  // ---------------- DELETE TRANSACTION ----------------
  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/transactions/${deleteId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (res.status === 401) {
        useAuthStore.getState().logout();
        router.push("/login");
        return;
      }

      if (res.ok) {
        setTransactions((prev) => prev.filter((t: any) => t._id !== deleteId));
        setDeleteId(null);
      }
    } catch (error) {
      console.log("Delete failed", error);
    }
  };

  const downloadCSV = () => {
    if (!filteredTransactions.length) return;

    const headers = ["Description", "Amount", "Type", "Category", "Date"];

    const rows = filteredTransactions.map((t: any) => [
      t.description,
      t.amount,
      t.type,
      t.category,
      new Date(t.date).toLocaleDateString(),
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map((e) => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "filtered_transactions.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 relative">
      {/* Add Transaction Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 dark:bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-card text-card-foreground rounded-xl shadow-xl w-full max-w-lg p-4 animate-in fade-in zoom-in border">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xl font-semibold">Add Transaction</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-muted-foreground hover:text-foreground text-lg"
              >
                ✕
              </button>
            </div>
            <AddTransactionForm />
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Transactions</h1>
          <p className="text-muted-foreground text-sm">
            Manage and view all your transactions
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={downloadCSV}
            className="flex gap-2"
          >
            Export CSV
          </Button>

          <Button className="flex gap-2" onClick={() => setShowAddModal(true)}>
            <PlusCircle size={18} /> Add Transaction
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex gap-2 items-center text-lg">
            <Filter size={18} /> Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            placeholder="Search by description or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="expense">Expense</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Transactions List */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {filteredTransactions.length === 0 && (
            <p className="text-muted-foreground text-sm">
              No matching transactions found.
            </p>
          )}

          {filteredTransactions.map((t: any) => (
            <div
              key={t._id}
              className="flex justify-between items-center p-5 border rounded-xl bg-card"
            >
              <div>
                <p className="font-medium">{t.description}</p>
                <p className="text-xs text-muted-foreground">
                  {t.category} • {new Date(t.date).toLocaleDateString()}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`font-semibold ${
                    t.type === "income" 
                      ? "text-green-600 dark:text-green-400" 
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {t.type === "income" ? "+" : "-"}₹{t.amount}
                </span>

                <Trash
                  onClick={() => setDeleteId(t._id)}
                  className="text-destructive cursor-pointer hover:text-destructive/80 text-sm"
                />

                <Pencil
                  onClick={() => {
                    setEditData(t);
                    setShowEditModal(true);
                  }}
                  className="text-primary cursor-pointer hover:text-primary/80 text-sm"
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Delete Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 dark:bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-card text-card-foreground p-6 rounded-xl shadow-xl w-full max-w-sm border">
            <h2 className="text-lg font-semibold mb-2">Delete Transaction?</h2>
            <p className="text-sm text-muted-foreground mb-4">
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDeleteId(null)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/40 dark:bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-card text-card-foreground rounded-xl shadow-xl w-full max-w-lg p-4 border">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xl font-semibold">Edit Transaction</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-muted-foreground hover:text-foreground text-lg"
              >
                ✕
              </button>
            </div>
            <EditTransactionForm
              data={editData}
              onClose={() => setShowEditModal(false)}
              onUpdated={(updatedTx: any) => {
                setTransactions((prev: any) =>
                  prev.map((t: any) =>
                    t._id === updatedTx._id ? updatedTx : t
                  )
                );
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
