"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { TrendingUp, PieChart as PieIcon, Brain, Calendar } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

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
        Authorization: `Bearer ${accessToken}`
      }
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
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Insights</h1>
        <p className="text-gray-500 text-sm">
          AI-powered breakdown of your spending habits
        </p>
      </div>

      {/* Monthly Summary */}
      <Card className="shadow-sm">
        <CardHeader className="flex items-center gap-3">
          <TrendingUp className="text-blue-600" />
          <CardTitle>Monthly Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-gray-700"
          >
            {loadingSummary && <p>Generating monthly summary…</p>}

            {!loadingSummary && monthlySummary && (
              <ul className="list-disc pl-5 space-y-2 whitespace-pre-line">
                {monthlySummary.split("\n").map((line, i) => (
                  <li key={i}>{line.replace(/^[^\w]+/, "").trim()}</li>
                ))}
              </ul>
            )}

            {!loadingSummary && !monthlySummary && (
              <p className="text-gray-500 text-sm">
                Not enough data to generate a summary.
              </p>
            )}
          </motion.div>
        </CardContent>
      </Card>

      {/* Category Breakdown Pie Chart */}
      <Card className="shadow-sm">
        <CardHeader className="flex items-center gap-3">
          <PieIcon className="text-purple-600" />
          <CardTitle>Category Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="h-[280px] flex items-center justify-center">
          {stats?.categoryBreakdown?.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.categoryBreakdown}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={90}
                  label
                >
                  {stats.categoryBreakdown.map((entry: any, index: number) => (
                    <Cell
                      key={entry.name}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-sm">No category data available.</p>
          )}
        </CardContent>
      </Card>

      {/* AI Financial Insights */}
      <Card className="shadow-sm">
        <CardHeader className="flex items-center gap-3">
          <Brain className="text-rose-600" />
          <CardTitle>AI Financial Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-50 p-4 rounded-xl border text-gray-700 leading-relaxed min-h-[80px]"
          >
            {loadingInsights && <p>Generating insights with AI…</p>}
            {!loadingInsights && aiInsights && (
              <p className="whitespace-pre-line">{aiInsights}</p>
            )}
            {!loadingInsights && !aiInsights && (
              <p className="text-gray-500 text-sm">
                Not enough data yet to generate insights.
              </p>
            )}
          </motion.div>
        </CardContent>
      </Card>

      {/* Anomaly Detection */}
      <Card className="shadow-sm">
        <CardHeader className="flex items-center gap-3">
          <TrendingUp className="text-red-500" />
          <CardTitle>Spending Anomalies</CardTitle>
        </CardHeader>

        <CardContent>
          {!anomalies.length && (
            <p className="text-gray-500 text-sm">
              No unusual spending detected.
            </p>
          )}

          {anomalies.length > 0 && (
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
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
        <CardHeader>
          <CardTitle>AI Budget Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-50 p-4 rounded-xl border text-gray-700 leading-relaxed"
          >
            {loadingBudget && <p>Calculating smart budget suggestions…</p>}

            {!loadingBudget && budgetText && (
              <ul className="list-disc pl-5 space-y-2 whitespace-pre-line">
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
              <p className="text-gray-500 text-sm">
                Not enough data to suggest a budget yet.
              </p>
            )}
          </motion.div>
        </CardContent>
      </Card>

      {/* Month-over-Month Comparison */}
      <Card className="shadow-sm">
        <CardHeader className="flex items-center gap-3">
          <Calendar className="text-green-600" />
          <CardTitle>Month-over-Month Comparison</CardTitle>
        </CardHeader>
        <CardContent className="text-gray-700">
          {!stats?.monthComparison ? (
            <p className="text-gray-500 text-sm">
              Not enough data to compare months.
            </p>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              <div className="p-4 rounded-xl border bg-white">
                <p className="text-sm text-gray-500">This Month</p>
                <p className="text-2xl font-bold">
                  ₹ {stats.monthComparison.thisMonth || 0}
                </p>
              </div>

              <div className="p-4 rounded-xl border bg-white">
                <p className="text-sm text-gray-500">Last Month</p>
                <p className="text-2xl font-bold">
                  ₹ {stats.monthComparison.lastMonth || 0}
                </p>
              </div>

              <div className="p-4 rounded-xl border bg-white">
                <p className="text-sm text-gray-500">Difference</p>
                <p
                  className={`text-2xl font-bold ${
                    stats.monthComparison.difference > 0
                      ? "text-red-500"
                      : "text-green-600"
                  }`}
                >
                  {stats.monthComparison.difference > 0 ? "+" : "-"} ₹{" "}
                  {Math.abs(stats.monthComparison.difference || 0)}
                </p>
                <p className="text-sm text-gray-500 mt-1">
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
