"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { TrendingUp, PieChart as PieIcon, Brain, Calendar } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";

const COLORS = [
  "#4f46e5",
  "#22c55e",
  "#f97316",
  "#e11d48",
  "#0ea5e9",
  "#9333ea",
  "#64748b",
  "#84cc16",
  "#f43f5e",
  "#14b8a6",
  "#a855f7",
  "#facc15",
];

export default function InsightsPage() {
  const accessToken = useAuthStore((s: any) => s.accessToken);
  const router = useRouter();
  const [anomalies, setAnomalies] = useState([]);
  const [stats, setStats] = useState<any>(null);

  const [monthlySummary, setMonthlySummary] = useState("");
  const [loadingSummary, setLoadingSummary] = useState(false);

  const [aiInsights, setAiInsights] = useState("");
  const [loadingInsights, setLoadingInsights] = useState(false);

  const [budgetText, setBudgetText] = useState("");
  const [loadingBudget, setLoadingBudget] = useState(false);

  useEffect(() => {
    if (!stats || !accessToken) return;

    const fetchAnomalies = async () => {
      const res = await fetch("/api/ai/anomaly", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await res.json();
      setAnomalies(data.anomalies || []);
    };

    fetchAnomalies();
  }, [stats]);

  // 1) Fetch stats from /api/dashboard
  useEffect(() => {
    if (!accessToken) {
      return;
    }

    const fetchStats = async () => {
      const res = await fetch("/api/dashboard", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (res.status === 401) {
        useAuthStore.getState().logout();
        router.push("/login");
        return;
      }

      if (!res.ok) return;

      const data = await res.json();
      setStats(data);
    };

    fetchStats();
  }, [accessToken, router]);

  // 2) AI Monthly Summary
  useEffect(() => {
    if (!stats) return;

    const getMonthlySummary = async () => {
      setLoadingSummary(true);

      const res = await fetch("/api/ai/monthly-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stats }),
      });

      const data = await res.json();
      setMonthlySummary(data.summary);
      setLoadingSummary(false);
    };

    getMonthlySummary();
  }, [stats]);

  // 3) AI Insights
  useEffect(() => {
    if (!stats) return;

    const fetchInsights = async () => {
      setLoadingInsights(true);

      const res = await fetch("/api/ai/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stats }),
      });

      const data = await res.json();
      setAiInsights(data.insights);
      setLoadingInsights(false);
    };

    fetchInsights();
  }, [stats]);

  // 4) AI Budget Recommendation
  useEffect(() => {
    if (!stats) return;

    const fetchBudget = async () => {
      setLoadingBudget(true);

      const res = await fetch("/api/ai/budget", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stats }),
      });

      const data = await res.json();
      setBudgetText(data.budget);
      setLoadingBudget(false);
    };

    fetchBudget();
  }, [stats]);

  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Insights</h1>
        <p className="text-muted-foreground text-xs sm:text-sm">
          AI-powered breakdown of your spending habits
        </p>
      </div>

      {/* Monthly Summary */}
      <Card className="shadow-sm">
        <CardHeader className="flex items-center gap-2 sm:gap-3 pb-3">
          <TrendingUp className="text-blue-600 dark:text-blue-400 w-4 h-4 sm:w-5 sm:h-5" />
          <CardTitle className="text-base sm:text-lg">
            Monthly Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-foreground"
          >
            {loadingSummary && (
              <p className="text-sm">Generating monthly summary…</p>
            )}

            {!loadingSummary && monthlySummary && (
              <ul className="list-disc pl-4 sm:pl-5 space-y-1 sm:space-y-2 whitespace-pre-line text-sm sm:text-base">
                {monthlySummary.split("\n").map((line, i) => (
                  <li key={i}>{line.replace(/^[^\w]+/, "").trim()}</li>
                ))}
              </ul>
            )}

            {!loadingSummary && !monthlySummary && (
              <p className="text-muted-foreground text-xs sm:text-sm">
                Not enough data to generate a summary.
              </p>
            )}
          </motion.div>
        </CardContent>
      </Card>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Line Chart */}
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base sm:text-lg">
              Monthly Expense Trend
            </CardTitle>
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
            <CardTitle className="text-base sm:text-lg">
              Category Breakdown
            </CardTitle>
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

      {/* AI Financial Insights */}
      <Card className="shadow-sm">
        <CardHeader className="flex items-center gap-2 sm:gap-3 pb-3">
          <Brain className="text-rose-600 dark:text-rose-400 w-4 h-4 sm:w-5 sm:h-5" />
          <CardTitle className="text-base sm:text-lg">
            AI Financial Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-muted p-3 sm:p-4 rounded-xl border text-foreground leading-relaxed min-h-[80px] text-sm sm:text-base"
          >
            {loadingInsights && <p>Generating insights with AI…</p>}
            {!loadingInsights && aiInsights && (
              <p className="whitespace-pre-line">{aiInsights}</p>
            )}
            {!loadingInsights && !aiInsights && (
              <p className="text-muted-foreground text-xs sm:text-sm">
                Not enough data yet to generate insights.
              </p>
            )}
          </motion.div>
        </CardContent>
      </Card>

      {/* Anomaly Detection */}
      <Card className="shadow-sm">
        <CardHeader className="flex items-center gap-2 sm:gap-3 pb-3">
          <TrendingUp className="text-red-500 dark:text-red-400 w-4 h-4 sm:w-5 sm:h-5" />
          <CardTitle className="text-base sm:text-lg">
            Spending Anomalies
          </CardTitle>
        </CardHeader>

        <CardContent>
          {!anomalies.length && (
            <p className="text-muted-foreground text-xs sm:text-sm">
              No unusual spending detected.
            </p>
          )}

          {anomalies.length > 0 && (
            <ul className="list-disc pl-4 sm:pl-5 space-y-1 sm:space-y-2 text-foreground text-sm sm:text-base">
              {anomalies.map((a: any, i: number) => (
                <li key={i}>
                  <strong>{a.day}:</strong> {a.message}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* AI Budget Recommendations */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg">
            AI Budget Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-muted p-3 sm:p-4 rounded-xl border text-foreground leading-relaxed text-sm sm:text-base"
          >
            {loadingBudget && <p>Calculating smart budget suggestions…</p>}

            {!loadingBudget && budgetText && (
              <ul className="list-disc pl-4 sm:pl-5 space-y-1 sm:space-y-2 whitespace-pre-line">
                {budgetText
                  .split("\n")
                  .map((line) => line.trim())
                  .filter((line) => line.length > 0)
                  .map((line, i) => (
                    <li key={i}>
                      {line
                        .replace(/\*\*/g, "")
                        .replace(/^[^\w]+/, "")
                        .trim()}
                    </li>
                  ))}
              </ul>
            )}

            {!loadingBudget && !budgetText && (
              <p className="text-muted-foreground text-xs sm:text-sm">
                Not enough data to suggest a budget yet.
              </p>
            )}
          </motion.div>
        </CardContent>
      </Card>

      {/* Month-over-Month Comparison */}
      <Card className="shadow-sm">
        <CardHeader className="flex items-center gap-2 sm:gap-3 pb-3">
          <Calendar className="text-green-600 dark:text-green-400 w-4 h-4 sm:w-5 sm:h-5" />
          <CardTitle className="text-base sm:text-lg">
            Month-over-Month Comparison
          </CardTitle>
        </CardHeader>
        <CardContent className="text-foreground">
          {!stats?.monthComparison ? (
            <p className="text-muted-foreground text-xs sm:text-sm">
              Not enough data to compare months.
            </p>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4"
            >
              <div className="p-3 sm:p-4 rounded-xl border bg-card">
                <p className="text-xs sm:text-sm text-muted-foreground">
                  This Month
                </p>
                <p className="text-xl sm:text-2xl font-bold">
                  ₹ {stats.monthComparison.thisMonth || 0}
                </p>
              </div>

              <div className="p-3 sm:p-4 rounded-xl border bg-card">
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Last Month
                </p>
                <p className="text-xl sm:text-2xl font-bold">
                  ₹ {stats.monthComparison.lastMonth || 0}
                </p>
              </div>

              <div className="p-3 sm:p-4 rounded-xl border bg-card sm:col-span-2 md:col-span-1">
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Difference
                </p>
                <p
                  className={`text-xl sm:text-2xl font-bold ${
                    stats.monthComparison.difference > 0
                      ? "text-red-500 dark:text-red-400"
                      : "text-green-600 dark:text-green-400"
                  }`}
                >
                  {stats.monthComparison.difference > 0 ? "+" : "-"} ₹{" "}
                  {Math.abs(stats.monthComparison.difference || 0)}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  {stats.monthComparison.lastMonth === 0
                    ? "No spending last month."
                    : `${(
                        (stats.monthComparison.difference /
                          stats.monthComparison.lastMonth) *
                        100
                      ).toFixed(1)}% ${
                        stats.monthComparison.difference > 0
                          ? "increase"
                          : "decrease"
                      }`}
                </p>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
