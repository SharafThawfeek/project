"use client";

import { useState } from "react";
import Image from "next/image";
import UploadForm from "@/components/UploadForm";
import LiveRecorder from "@/components/LiveRecorder";
import FeedbackCard from "@/components/FeedbackCard";
import { API_BASE } from "@/lib/api";
import { motion } from "framer-motion";
import { Mic, Upload, Brain, LineChart, Sparkles } from "lucide-react";

export default function SpeakPage() {
  const [result, setResult] = useState<{
    transcript: string;
    feedback: any;
    spoken_feedback_file?: string;
  } | null>(null);

  const audioUrl = result?.spoken_feedback_file
    ? `${API_BASE}/${result.spoken_feedback_file}`
    : undefined;

  return (
    <div className="w-full overflow-y-auto bg-gradient-to-br from-gray-50 via-white to-indigo-50 text-gray-900">
      {/* 🌟 HERO SECTION */}
      <section className="relative overflow-hidden py-24 px-6 text-center bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white shadow-lg rounded-3xl mb-12">
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-5xl md:text-6xl font-extrabold mb-4"
        >
          Speak with Confidence
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-lg md:text-xl max-w-3xl mx-auto text-indigo-100"
        >
          Train your voice, enhance your clarity, and communicate like a leader with our
          AI-powered Public Speaking Coach.
        </motion.p>

        <div className="absolute top-0 left-0 w-full h-full bg-[url('/wave-pattern.svg')] bg-cover bg-center opacity-10 pointer-events-none"></div>
      </section>

      {/* 💡 ABOUT SECTION */}
      <section className="py-20 px-8 md:px-24 bg-white rounded-3xl shadow-sm mb-16">
        <div className="max-w-5xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            What Makes Our <span className="text-indigo-600">AI Coach</span> Special?
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed">
            Our system listens, understands, and evaluates every aspect of your speech — 
            from tone and pronunciation to grammar and confidence — providing precise, 
            constructive feedback every time.
          </p>
        </div>

        {/* Three Feature Cards */}
        <div className="grid md:grid-cols-3 gap-10 mt-12">
          {[
            {
              icon: <Brain className="w-10 h-10 text-indigo-500" />,
              title: "AI-Powered Analysis",
              desc: "Using advanced models, your speech is assessed for clarity, energy, and tone.",
            },
            {
              icon: <Sparkles className="w-10 h-10 text-purple-500" />,
              title: "Instant Personalized Feedback",
              desc: "Get targeted suggestions to improve your speaking confidence and fluency.",
            },
            {
              icon: <LineChart className="w-10 h-10 text-pink-500" />,
              title: "Progress Visualization",
              desc: "See your growth over time through performance charts and scores.",
            },
          ].map((feature, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -5 }}
              className="bg-gradient-to-b from-gray-50 to-white rounded-2xl shadow-md p-8 hover:shadow-2xl transition-all text-center"
            >
              <div className="flex justify-center mb-4">{feature.icon}</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 🖼️ IMAGE SHOWCASE SECTION */}
      <section className="py-20 px-8 md:px-24 bg-gradient-to-b from-indigo-50 to-white text-center mb-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Learn, Practice & Evolve
          </h2>
          <p className="text-gray-600 mb-10 max-w-3xl mx-auto">
            Our public speaking AI isn’t just a tool — it’s your personal speech coach.
            Practice daily, track progress, and gain the confidence to impress any audience.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="flex justify-center"
          >
            <div className="relative w-full max-w-3xl h-[420px] rounded-2xl overflow-hidden shadow-2xl border border-indigo-100">
              <Image
                src="/speak.png"
                alt="AI Speaking Coach Preview"
                fill
                className="object-cover object-center hover:scale-105 transition-transform duration-700"
                priority
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* 🎤 RECORD & UPLOAD SECTION */}
      <section className="py-20 px-6 md:px-24 bg-white rounded-3xl shadow-sm mb-20">
        <div className="max-w-6xl mx-auto space-y-12">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-center text-gray-800"
          >
            Practice with Your <span className="text-indigo-600">AI Coach</span>
          </motion.h2>

          <p className="text-center text-gray-600 max-w-2xl mx-auto">
            Upload a recording or speak live — our system will analyze and give you 
            professional-grade feedback instantly.
          </p>

          {/* Upload + Live Recorder Side by Side */}
          <div className="grid md:grid-cols-2 gap-10">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-indigo-50 to-white rounded-3xl shadow-lg p-8 border border-gray-100"
            >
              <div className="flex items-center gap-3 mb-3 text-indigo-600 font-semibold text-lg">
                <Upload className="w-5 h-5" />
                Upload Speech
              </div>
              <p className="text-gray-600 text-sm mb-4">
                Upload a pre-recorded audio file to receive a detailed evaluation of your
                delivery, confidence, and tone.
              </p>
              <UploadForm onResult={setResult} />
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-purple-50 to-white rounded-3xl shadow-lg p-8 border border-gray-100"
            >
              <div className="flex items-center gap-3 mb-3 text-purple-600 font-semibold text-lg">
                <Mic className="w-5 h-5" />
                Live Recording
              </div>
              <p className="text-gray-600 text-sm mb-4">
                Record live and let our AI analyze your performance instantly.
              </p>
              <LiveRecorder onResult={setResult} />
            </motion.div>
          </div>

          {/* Result Section */}
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="mt-10 space-y-6"
            >
              <div className="bg-white rounded-3xl shadow-lg p-8 border border-indigo-100">
                <h3 className="font-semibold text-gray-800 text-lg mb-2">Transcript</h3>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {result.transcript || "No transcript available."}
                </p>
              </div>
              <FeedbackCard data={result.feedback} audioUrl={audioUrl} />
            </motion.div>
          )}
        </div>
      </section>

      {/* 💬 FOOTER */}
      <footer className="text-center py-10 bg-white border-t border-gray-200 text-gray-500 text-sm">
        Made with ❤️ by <span className="text-indigo-500 font-semibold">AI Speaking Coach</span>
      </footer>
    </div>
  );
}
