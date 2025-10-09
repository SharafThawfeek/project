"use client";

import { motion, type Variants } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { Lightbulb, BookOpen, Mic, PenTool, Target, Sparkles } from "lucide-react";

type FeedbackProps = { feedback: Record<string, any> };
type SectionCfg = { label: string; icon: LucideIcon; gradient: string };

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
  }),
};

const sections: Record<string, SectionCfg> = {
  opening: { label: "Opening", icon: Sparkles, gradient: "from-indigo-400/30 to-blue-400/30" },
  content: { label: "Content", icon: BookOpen, gradient: "from-purple-400/30 to-pink-400/30" },
  delivery: { label: "Delivery", icon: Mic, gradient: "from-emerald-400/30 to-cyan-400/30" },
  grammar: { label: "Grammar", icon: PenTool, gradient: "from-amber-400/30 to-orange-400/30" },
  overall: { label: "Overall", icon: Target, gradient: "from-indigo-500/40 to-purple-500/40" },
  suggestions: { label: "Suggestions", icon: Lightbulb, gradient: "from-pink-400/30 to-rose-400/30" },
};

function titleize(k: string) {
  return k.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// ✅ Renders any data shape safely (string, array, nested object)
function renderValue(value: any) {
  if (!value) return <p className="text-gray-500 italic">No feedback available.</p>;

  if (Array.isArray(value)) {
    return (
      <ul className="list-disc list-inside text-gray-700 text-sm leading-relaxed">
        {value.slice(0, 5).map((v, i) => (
          <li key={i}>{String(v)}</li>
        ))}
      </ul>
    );
  }

  if (typeof value === "object") {
    const { summary, strengths, weaknesses, score } = value;

    return (
      <div className="space-y-2 text-sm text-gray-700">
        {summary && <p className="font-medium">{summary}</p>}
        {Array.isArray(strengths) && strengths.length > 0 && (
          <div>
            <p className="font-semibold text-green-700 mt-1">✅ Strengths:</p>
            <ul className="list-disc list-inside">
              {strengths.slice(0, 3).map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
        )}
        {Array.isArray(weaknesses) && weaknesses.length > 0 && (
          <div>
            <p className="font-semibold text-red-700 mt-1">⚠️ Weaknesses:</p>
            <ul className="list-disc list-inside">
              {weaknesses.slice(0, 3).map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          </div>
        )}
        {typeof score === "number" && (
          <p className="text-indigo-600 font-semibold">Score: {score}/10</p>
        )}
        {!summary && !strengths && !weaknesses && !score && (
          <pre className="text-xs bg-gray-50 p-2 rounded-md text-gray-600 overflow-x-auto">
            {JSON.stringify(value, null, 2)}
          </pre>
        )}
      </div>
    );
  }

  if (typeof value === "string") {
    return <p className="text-gray-700 text-sm leading-relaxed">{value}</p>;
  }

  if (typeof value === "number") {
    return <p className="text-indigo-600 font-semibold">Score: {value}/10</p>;
  }

  return <p className="text-gray-500 italic">Unsupported data type</p>;
}

export default function AnalyzeFeedback({ feedback }: FeedbackProps) {
  if (!feedback) return null;
  console.log("📊 FEEDBACK RECEIVED:", feedback); // helpful debug

  return (
    <div className="mt-12 space-y-8">
      <h2 className="text-3xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 drop-shadow-lg">
        💬 AI Feedback Summary
      </h2>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {Object.entries(feedback).map(([key, value], i) => {
          const section = sections[key.toLowerCase()] ?? {
            label: titleize(key),
            icon: Lightbulb,
            gradient: "from-gray-200/30 to-gray-100/30",
          };
          const Icon = section.icon;

          return (
            <motion.div
              key={key}
              custom={i}
              initial="hidden"
              animate="visible"
              variants={cardVariants}
              whileHover={{ scale: 1.04, y: -5 }}
              className="relative group rounded-3xl overflow-hidden border border-white/30 backdrop-blur-xl bg-white/40 shadow-lg hover:shadow-2xl transition-all duration-500"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${section.gradient} opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-700`}
              />
              <div className="relative p-6 z-10 text-left">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-white/60 rounded-xl shadow-sm">
                    <Icon className="w-6 h-6 text-indigo-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">{section.label}</h3>
                </div>
                {renderValue(value)}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
