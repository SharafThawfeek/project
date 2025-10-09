"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Clock,
  MessageSquare,
  Trophy,
  TrendingUp,
  Award,
  Star,
  History,
} from "lucide-react";
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

export default function HistoryPage() {
  const [speeches, setSpeeches] = useState<any[]>([]);
  const [progress, setProgress] = useState<any[]>([]);
  const [avgScores, setAvgScores] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    // Fetch user speech history
    fetch("http://localhost:8000/history", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setSpeeches(data.speeches || []))
      .catch((err) => console.error("Failed to load history:", err));

    // Fetch progress and averages
    fetch("http://localhost:8000/progress", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setProgress(data.progress || []);
        setAvgScores(data.averages || null);
      })
      .catch((err) => console.error("Failed to load progress:", err));
  }, []);

  const renderFeedback = (fb: any) => {
    if (!fb) return <p className="italic text-gray-500">No feedback recorded.</p>;

    const overall =
      typeof fb.overall === "object" && fb.overall.summary
        ? fb.overall.summary
        : typeof fb.overall === "string"
        ? fb.overall
        : "N/A";

    const scores = fb.scores || {};

    return (
      <div className="mt-3 text-sm text-gray-700 space-y-1">
        <p>
          <strong className="text-indigo-600">Overall:</strong> {overall}
        </p>
        <div className="text-xs text-gray-600">
          <strong>Scores:</strong>{" "}
          {Object.entries(scores)
            .map(([k, v]) => `${k}: ${v ?? "-"}`)
            .join(", ")}
        </div>
      </div>
    );
  };

  const renderBadge = (score: number) => {
    if (score >= 8)
      return <span className="text-green-600 font-semibold">🌟 Excellent</span>;
    if (score >= 6)
      return <span className="text-blue-600 font-semibold">👍 Good</span>;
    return <span className="text-yellow-600 font-semibold">💪 Needs Work</span>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50 px-8 py-12">
      {/* 🏆 Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="text-center mb-12"
      >
        <div className="inline-flex items-center justify-center p-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl shadow-lg">
          <History className="w-8 h-8 text-white mr-3" />
          <h1 className="text-3xl font-extrabold text-white tracking-wide">
            Your Speech History
          </h1>
        </div>
        <p className="text-gray-500 mt-4 text-sm">
          See your growth and track your speaking performance 🎤
        </p>
      </motion.div>

      {/* 🧮 Average Scores Summary */}
      {avgScores && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-12"
        >
          {[
            { label: "Opening", value: avgScores.avg_opening, color: "from-pink-400 to-rose-500" },
            { label: "Content", value: avgScores.avg_content, color: "from-purple-400 to-indigo-500" },
            { label: "Delivery", value: avgScores.avg_delivery, color: "from-blue-400 to-cyan-500" },
            { label: "Grammar", value: avgScores.avg_grammar, color: "from-amber-400 to-orange-500" },
            { label: "Overall", value: avgScores.avg_overall, color: "from-emerald-400 to-green-500" },
          ].map((item, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05 }}
              className={`p-4 rounded-2xl shadow-md bg-gradient-to-br ${item.color} text-white text-center`}
            >
              <p className="font-semibold text-lg">{item.label}</p>
              <p className="text-3xl font-bold mt-2">{item.value?.toFixed(1) ?? "-"}</p>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* 📈 Progress Chart */}
      {progress.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="bg-white/80 backdrop-blur-lg border border-indigo-100 rounded-3xl shadow-md p-6 mb-16"
        >
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-6 h-6 text-indigo-600" />
            <h2 className="text-lg font-semibold text-gray-800">
              Performance Progress Over Time
            </h2>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={progress}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(v) =>
                    new Date(v).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }
                  tick={{ fontSize: 12 }}
                />
                <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="score_opening" stroke="#f43f5e" name="Opening" />
                <Line type="monotone" dataKey="score_content" stroke="#22c55e" name="Content" />
                <Line type="monotone" dataKey="score_delivery" stroke="#3b82f6" name="Delivery" />
                <Line type="monotone" dataKey="score_grammar" stroke="#eab308" name="Grammar" />
                <Line type="monotone" dataKey="score_overall" stroke="#8b5cf6" name="Overall" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* 🗂 Speech Cards */}
      {speeches.length === 0 ? (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-gray-500 mt-12"
        >
          No speech records yet. Record one to get started!
        </motion.p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {speeches.map((s, i) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.03, y: -5 }}
              className="relative bg-white rounded-3xl shadow-md hover:shadow-xl border border-gray-100 overflow-hidden group transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-100/40 via-purple-100/30 to-pink-100/40 opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-700" />
              <div className="relative p-6 z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-indigo-500" />
                    <p className="text-xs text-gray-500">
                      {new Date(s.created_at).toLocaleString()}
                    </p>
                  </div>
                  <Trophy className="w-5 h-5 text-yellow-500" />
                </div>

                <p className="text-gray-800 text-sm leading-relaxed line-clamp-4">
                  {s.transcript || "(No transcript)"}
                </p>

                <div className="mt-4 border-t border-gray-200 pt-3">
                  <div className="flex items-center gap-2 mb-1">
                    <MessageSquare className="w-4 h-4 text-purple-500" />
                    <h3 className="text-sm font-semibold text-gray-700">
                      Feedback
                    </h3>
                  </div>
                  {renderFeedback(s.feedback)}
                </div>

                {s.feedback?.scores?.overall && (
                  <div className="mt-3 text-sm">
                    {renderBadge(s.feedback.scores.overall)}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
