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
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  // ThemeToggle,
} from "@/components/ui/sidebar";
import { ChevronLeft, ChevronRight, LogOut } from "lucide-react";

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
  const pathname = usePathname();

  useEffect(() => {
    if (!stats || !accessToken) return;

    const getSummary = async () => {
      try {
        const res = await fetch("/api/ai/summary", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`, // Add this line
          },
          body: JSON.stringify({ stats }),
        });

        if (!res.ok) {
          console.error("AI summary failed:", res.status);
          return;
        }

        const data = await res.json();
        setAiSummary(data.summary || "");
      } catch (err) {
        console.error("Error fetching AI summary:", err);
      }
    };

    getSummary();
  }, [stats, accessToken]); // Add accessToken to dependencies

  useEffect(() => {
    // Redirect if no access token
    if (!accessToken) {
      router.push("/login");
      return;
    }

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
  }, [accessToken, router]);

  return (
    <div className="min-h-screen bg-background p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-6">
      {/* Add Transaction Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 dark:bg-black/60 flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-card text-card-foreground rounded-xl shadow-xl w-full max-w-lg p-3 sm:p-4 animate-in fade-in zoom-in border">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg sm:text-xl font-semibold">Add Transaction</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-muted-foreground hover:text-foreground text-lg sm:text-xl"
              >
                ✕
              </button>
            </div>
            <AddTransactionForm />
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground text-xs sm:text-sm md:text-base">
            Overview of your finances at a glance.
          </p>
        </div>

        <Button 
          className="flex gap-2 w-full sm:w-auto text-sm sm:text-base" 
          onClick={() => setShowAddModal(true)}
          size="sm"
        >
          <PlusCircle size={16} className="sm:w-[18px] sm:h-[18px]" /> 
          <span className="hidden xs:inline">Add Transaction</span>
          <span className="xs:hidden">Add</span>
        </Button>
      </div>

      {/* AI Spending Summary */}
      {aiSummary && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base sm:text-lg">AI Spending Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground leading-relaxed text-sm sm:text-base">{aiSummary}</p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
        {/* Expense Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">
                Total Expense (This Month)
              </CardTitle>
              <ArrowDownCircle className="text-red-500 w-4 h-4 sm:w-5 sm:h-5" />
            </CardHeader>
            <CardContent>
              <p className="text-xl sm:text-2xl font-semibold">₹ {stats?.expense || 0}</p>
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
              <CardTitle className="text-xs sm:text-sm font-medium">
                Total Income (This Month)
              </CardTitle>
              <ArrowUpCircle className="text-green-500 w-4 h-4 sm:w-5 sm:h-5" />
            </CardHeader>
            <CardContent>
              <p className="text-xl sm:text-2xl font-semibold">₹ {stats?.income || 0}</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Savings Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="sm:col-span-2 md:col-span-1"
        >
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">
                Savings (This Month)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl sm:text-2xl font-semibold">₹ {stats?.savings || 0}</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Line Chart */}
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base sm:text-lg">Monthly Expense Trend</CardTitle>
          </CardHeader>
          <CardContent className="h-[240px] sm:h-[280px] min-h-[240px]">
            {stats?.monthlyTrend?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%" minHeight={240}>
                <LineChart data={stats.monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 10 }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="expense"
                    stroke="#4f46e5"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                No data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base sm:text-lg">Category Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="h-[240px] sm:h-[280px] min-h-[240px] flex justify-center">
            {stats?.categoryBreakdown?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%" minHeight={240}>
                <PieChart>
                  <Pie
                    data={stats.categoryBreakdown}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={60}
                    className="sm:outerRadius-[80px]"
                    label={{ fontSize: 10 }}
                  >
                    {stats.categoryBreakdown.map(
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
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                No category data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg">Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 sm:space-y-3">
            {stats?.recent?.map((t: any) => (
              <div
                key={t._id}
                className="flex justify-between items-center p-2 sm:p-3 border rounded-xl bg-card"
              >
                <div className="flex-1 min-w-0 pr-2">
                  <p className="font-medium text-sm sm:text-base truncate">{t.description}</p>
                  <p className="text-xs text-muted-foreground">{t.category}</p>
                </div>
                <span className="font-semibold text-sm sm:text-base whitespace-nowrap">₹ {t.amount}</span>
              </div>
            ))}

            {!stats?.recent?.length && (
              <p className="text-muted-foreground text-sm">No recent transactions.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
