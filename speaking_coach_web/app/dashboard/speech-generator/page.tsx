"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, Sparkles, FileText, Loader2, Copy, Trash2, CheckCircle2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function SpeechGeneratorPage() {
  const [prompt, setPrompt] = useState("");
  const [speech, setSpeech] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<{ id: string; title: string; content: string }[]>([]);

  // 🧠 Load from localStorage
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("speechHistory") || "[]");
    setHistory(saved);
  }, []);

  // 💾 Save to localStorage
  useEffect(() => {
    localStorage.setItem("speechHistory", JSON.stringify(history));
  }, [history]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setSpeech("");

    try {
      const res = await fetch("http://localhost:8000/generate-speech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: prompt, session_id: "user1" }),
      });

      const data = await res.json();
      const generated = data.answer || "⚠️ No response from AI.";
      setSpeech(generated);

      // 🧩 Save to history
      const newItem = {
        id: Date.now().toString(),
        title: prompt.slice(0, 40) + (prompt.length > 40 ? "..." : ""),
        content: generated,
      };
      setHistory([newItem, ...history]);
    } catch (error) {
      console.error(error);
      setSpeech("❌ Error: Unable to connect to backend.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleDelete = (id: string) => {
    const updated = history.filter((item) => item.id !== id);
    setHistory(updated);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(to bottom right, #eef2ff, #ffffff, #f3e8ff)",
        padding: "3rem 2rem",
        color: "#1f2937",
      }}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Sparkles size={32} color="#6366f1" />
          <h1 style={{ fontSize: "2rem", fontWeight: "bold", color: "#4338ca" }}>
            AI Speech Generator
          </h1>
        </div>
        <p style={{ marginTop: "1rem", maxWidth: "700px", color: "#4b5563" }}>
          Type a <b>topic</b> or <b>scenario</b> — and I’ll craft a confident, inspiring
          speech using the <span style={{ color: "#4f46e5", fontWeight: 600 }}>STAR method</span> (Situation, Task, Action, Result).
          <br />You can specify tone, duration, or audience for more customization.
        </p>
      </motion.div>

      {/* Input Section */}
      <div
        style={{
          backgroundColor: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: "10px",
          padding: "1.5rem",
          marginTop: "2rem",
          boxShadow: "0 2px 6px rgba(0, 0, 0, 0.05)",
        }}
      >
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={4}
          placeholder="e.g. Give me a 5-minute motivational speech about teamwork"
          style={{
            width: "100%",
            border: "1px solid #d1d5db",
            borderRadius: "8px",
            padding: "0.75rem",
            fontSize: "0.9rem",
            outline: "none",
            resize: "none",
          }}
        ></textarea>

        <button
          onClick={handleGenerate}
          disabled={loading}
          style={{
            marginTop: "1rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            background: "linear-gradient(to right, #6366f1, #8b5cf6)",
            color: "#fff",
            padding: "0.6rem 1.5rem",
            borderRadius: "8px",
            border: "none",
            cursor: loading ? "not-allowed" : "pointer",
            fontWeight: "600",
            boxShadow: "0 2px 5px rgba(99,102,241,0.4)",
          }}
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Generating...
            </>
          ) : (
            <>
              <Send size={16} /> Generate Speech
            </>
          )}
        </button>
      </div>

      {/* Generated Speech */}
      {speech && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            backgroundColor: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: "12px",
            padding: "2rem",
            marginTop: "2rem",
            boxShadow: "0 3px 10px rgba(0,0,0,0.08)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "1rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#4f46e5", fontWeight: 600 }}>
              <FileText size={18} />
              <span>Generated Speech</span>
            </div>
            <button
              onClick={() => handleCopy(speech)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                background: "none",
                border: "none",
                color: "#4f46e5",
                cursor: "pointer",
                fontSize: "0.9rem",
              }}
            >
              {copied ? (
                <>
                  <CheckCircle2 size={16} color="green" /> Copied!
                </>
              ) : (
                <>
                  <Copy size={16} /> Copy
                </>
              )}
            </button>
          </div>

          <div style={{ lineHeight: "1.7", color: "#374151" }}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {speech}
            </ReactMarkdown>
          </div>
        </motion.div>
      )}

      {/* History */}
      {history.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            backgroundColor: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: "12px",
            padding: "1.5rem",
            marginTop: "2.5rem",
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          }}
        >
          <h2 style={{ fontSize: "1.3rem", fontWeight: "bold", color: "#4338ca", marginBottom: "1rem" }}>
            🕓 Previous Speeches
          </h2>

          {history.map((item) => (
            <div
              key={item.id}
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                padding: "1rem",
                marginBottom: "1rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "0.5rem",
                }}
              >
                <h3 style={{ fontWeight: "600", color: "#4f46e5" }}>{item.title}</h3>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    onClick={() => handleCopy(item.content)}
                    style={{
                      border: "none",
                      background: "none",
                      color: "#4f46e5",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      fontSize: "0.85rem",
                    }}
                  >
                    <Copy size={14} /> Copy
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    style={{
                      border: "none",
                      background: "none",
                      color: "#dc2626",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      fontSize: "0.85rem",
                    }}
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>

              <p style={{ fontSize: "0.9rem", color: "#374151" }}>
                {item.content.slice(0, 250)}...
              </p>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
