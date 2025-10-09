"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { TrendingUp, BarChart3 } from "lucide-react";

export default function AnalyticsPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch("http://localhost:8000/analytics", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch((err) => console.error("Failed to load analytics:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-lg text-gray-500 animate-pulse">
          Loading analytics...
        </p>
      </div>
    );
  }

  if (!stats)
    return (
      <p className="text-center text-gray-500">
        No analytics data available yet.
      </p>
    );

  const safe = (val: any) =>
    typeof val === "number" && !isNaN(val) ? val : 0;

  const averages = [
    { name: "Opening", value: safe(stats.avg_opening) },
    { name: "Content", value: safe(stats.avg_content) },
    { name: "Delivery", value: safe(stats.avg_delivery) },
    { name: "Grammar", value: safe(stats.avg_grammar) },
    { name: "Overall", value: safe(stats.avg_overall) },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50 px-6 py-10">
      {/* Header */}
      <div className="text-center mb-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-3 bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3 rounded-2xl shadow-lg"
        >
          <BarChart3 className="w-6 h-6 text-white" />
          <h1 className="text-3xl font-bold text-white">
            AI Speech Analytics Dashboard
          </h1>
        </motion.div>
        <p className="text-gray-600 mt-3 text-sm">
          Track your long-term improvement and average performance 🚀
        </p>
      </div>

      {/* Averages Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid md:grid-cols-3 lg:grid-cols-5 gap-6 mb-12 max-w-6xl mx-auto"
      >
        {averages.map((item) => (
          <div
            key={item.name}
            className="bg-white shadow-md rounded-3xl p-6 border border-gray-100 text-center hover:shadow-xl transition-all"
          >
            <h3 className="text-lg font-semibold text-gray-800">
              {item.name}
            </h3>

            <p className="text-3xl font-bold text-indigo-600 mt-2">
              {item.value.toFixed(1)}
            </p>

            {/* Animated Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-3 mt-4 overflow-hidden">
              <motion.div
                className="h-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(item.value / 10) * 100}%` }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              />
            </div>

            <p className="text-xs text-gray-500 mt-2">out of 10</p>
          </div>
        ))}
      </motion.div>

      {/* Trend Chart */}
      {stats.trend?.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="bg-white/80 backdrop-blur-lg border border-indigo-100 rounded-3xl shadow-md p-6 max-w-6xl mx-auto"
        >
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-6 h-6 text-indigo-600" />
            <h2 className="text-lg font-semibold text-gray-800">
              Overall Progress Over Time
            </h2>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(v) =>
                    new Date(v).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }
                />
                <YAxis domain={[0, 10]} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#6366f1"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#818cf8" }}
                  activeDot={{ r: 6, fill: "#4f46e5" }}
                  name="Overall Score"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      ) : (
        <p className="text-center text-gray-500 mt-10">
          Not enough data for trend chart yet.
        </p>
      )}
    </div>
  );
}
