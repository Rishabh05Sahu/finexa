"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpCircle, ArrowDownCircle, PlusCircle } from "lucide-react";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { motion } from "framer-motion";
import AddTransactionForm from "@/components/molecules/addtransaction";

const COLORS = [
  "#4f46e5", // Indigo
  "#22c55e", // Green
  "#f97316", // Orange
  "#e11d48", // Red
  "#0ea5e9", // Sky Blue
  "#9333ea", // Purple
  "#64748b", // Slate Gray
  "#84cc16", // Lime
  "#f43f5e", // Rose
  "#14b8a6", // Teal
  "#a855f7", // Violet
  "#facc15", // Yellow
];

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const router = useRouter();
  const accessToken = useAuthStore((s: any) => s.accessToken);
  const [showAddModal, setShowAddModal] = useState(false);
  const [aiSummary, setAiSummary] = useState("");

  useEffect(() => {
    if (!stats) return;

    const getSummary = async () => {
      const res = await fetch("/api/ai/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stats }),
      });

      const data = await res.json();
      setAiSummary(data.summary);
    };

    getSummary();
  }, [stats]);

  useEffect(() => {
    if (!accessToken) return;

    const fetchDashboard = async () => {
      const res = await fetch("/api/dashboard", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // if token expired → redirect
      if (res.status === 401) {
        useAuthStore.getState().logout();
        router.push("/login");
        return;
      }

      if (!res.ok) return;

      const data = await res.json();
      setStats(data);
    };

    fetchDashboard();
  }, [accessToken]);

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8 space-y-6 relative">
      {/* Add Transaction Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-4 animate-in fade-in zoom-in">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xl font-semibold">Add Transaction</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-500 hover:text-gray-700 text-lg"
              >
                ✕
              </button>
            </div>
            <AddTransactionForm />
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-500 text-sm md:text-base">
            Overview of your finances at a glance.
          </p>
        </div>

        <Button className="flex gap-2" onClick={() => setShowAddModal(true)}>
          <PlusCircle size={18} /> Add Transaction
        </Button>
      </div>

      {/* Summary Cards */}
      {/* AI Spending Summary */}

      {aiSummary && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>AI Spending Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">{aiSummary}</p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Expense Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Total Expense (This Month)
              </CardTitle>
              <ArrowDownCircle className="text-red-500" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">₹ {stats?.expense || 0}</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Income Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Total Income (This Month)
              </CardTitle>
              <ArrowUpCircle className="text-green-500" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">₹ {stats?.income || 0}</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Savings Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Savings (This Month)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">₹ {stats?.savings || 0}</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line Chart */}
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader>
            <CardTitle>Monthly Expense Trend</CardTitle>
          </CardHeader>
          <CardContent className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats?.monthlyTrend || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="expense"
                  stroke="#4f46e5"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Category Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="h-[280px] flex justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats?.categoryBreakdown || []}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={80}
                  label
                >
                  {(stats?.categoryBreakdown || []).map(
                    (entry: any, index: number) => (
                      <Cell
                        key={entry.name}
                        fill={COLORS[index % COLORS.length]}
                      />
                    )
                  )}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats?.recent?.map((t: any) => (
              <div
                key={t._id}
                className="flex justify-between items-center p-3 border rounded-xl bg-white"
              >
                <div>
                  <p className="font-medium">{t.description}</p>
                  <p className="text-xs text-gray-500">{t.category}</p>
                </div>
                <span className="font-semibold">₹ {t.amount}</span>
              </div>
            ))}

            {!stats?.recent?.length && (
              <p className="text-gray-500 text-sm">No recent transactions.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
