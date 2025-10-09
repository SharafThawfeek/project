"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { API_BASE } from "@/lib/api";
import AnalyzeFeedback from "./AnalyzeFeedback";
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
import {
  TrendingUp,
  BarChart3,
  Mic,
  Pause,
  StopCircle,
  RefreshCw,
  Upload,
  Save,
} from "lucide-react";

export default function AnalyzePage() {
  const [recording, setRecording] = useState(false);
  const [paused, setPaused] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [chunks, setChunks] = useState<Blob[]>([]);
  const [duration, setDuration] = useState(0);
  const [feedback, setFeedback] = useState<any>(null);
  const [progress, setProgress] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 🎙 Load microphones
  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then((all) => {
      const mics = all.filter((d) => d.kind === "audioinput");
      setDevices(mics);
      if (mics.length > 0) setSelectedDeviceId(mics[0].deviceId);
    });
  }, []);

  // 🎤 Start Recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined },
      });

      const mimeType =
        MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? "audio/webm;codecs=opus"
          : "audio/webm";

      const recorder = new MediaRecorder(stream, { mimeType });
      const localChunks: Blob[] = [];

      recorder.ondataavailable = (e) => e.data.size > 0 && localChunks.push(e.data);

      recorder.onstop = async () => {
        const blob = new Blob(localChunks, { type: mimeType });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setChunks([blob]);
        stopStream();
      };

      recorder.start(100);
      mediaRecorderRef.current = recorder;
      streamRef.current = stream;
      setRecording(true);
      setPaused(false);
      setDuration(0);
      timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
    } catch (err) {
      alert("🎙 Please allow microphone access.");
      console.error(err);
    }
  };

  // ⏸ Pause / ▶ Resume
  const pauseRecording = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.pause();
      setPaused(true);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };
  const resumeRecording = () => {
    if (mediaRecorderRef.current?.state === "paused") {
      mediaRecorderRef.current.resume();
      setPaused(false);
      timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
    }
  };

  // ⏹ Stop
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive")
      mediaRecorderRef.current.stop();
    setRecording(false);
    setPaused(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  // 🔁 Reset
  const retryRecording = () => {
    setAudioUrl(null);
    setChunks([]);
    setFeedback(null);
    setDuration(0);
    setUploadedFile(null);
  };

  // Stop stream
  const stopStream = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
  };

  // 💾 Save Audio
  const handleSaveRecording = () => {
    if (!audioUrl) return;
    const a = document.createElement("a");
    a.href = audioUrl;
    a.download = "speech_recording.webm";
    a.click();
  };

  // 📂 Upload File
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setUploadedFile(file);
  };

  // 🔍 Analyze Audio (recorded or uploaded)
  const analyzeAudio = async () => {
    try {
      setLoading(true);
      const formData = new FormData();

      if (uploadedFile) {
        formData.append("file", uploadedFile);
      } else if (chunks.length) {
        formData.append("file", chunks[0], "speech.webm");
      } else {
        alert("Please record or upload an audio file first!");
        return;
      }

      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/analyze_audio`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setFeedback(data.feedback);

      // Fetch progress data
      const progRes = await fetch(`${API_BASE}/progress`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const progData = await progRes.json();
      setProgress(progData.progress || []);
    } catch (err) {
      console.error(err);
      alert("Error analyzing audio file.");
    } finally {
      setLoading(false);
    }
  };

  // 🖼 UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50 flex flex-col items-center py-12 px-6">
      <h1 className="text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 drop-shadow mb-10 text-center">
        🎙 AI Speech Analyzer
      </h1>

      {/* 🎚 Microphone Selector */}
      <div className="mb-6 text-center">
        <label className="block text-gray-700 font-medium mb-2">
          🎚 Select Microphone:
        </label>
        <select
          value={selectedDeviceId}
          onChange={(e) => setSelectedDeviceId(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 bg-white shadow-sm"
        >
          {devices.map((d) => (
            <option key={d.deviceId} value={d.deviceId}>
              {d.label || `Microphone ${d.deviceId.slice(0, 6)}`}
            </option>
          ))}
        </select>
      </div>

      {/* 🔴 Mic Animation */}
      <motion.div
        className="relative flex items-center justify-center"
        animate={recording ? { scale: [1, 1.15, 1] } : {}}
        transition={{ repeat: recording ? Infinity : 0, duration: 1.2 }}
      >
        <div className="w-36 h-36 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-5xl text-white shadow-2xl">
          {recording ? "🎙" : "🔈"}
        </div>
        <AnimatePresence>
          {recording && (
            <>
              <motion.div
                key="r1"
                className="absolute w-40 h-40 rounded-full border-4 border-indigo-400"
                animate={{ scale: [1, 1.3], opacity: [0.6, 0] }}
                transition={{ duration: 1.3, repeat: Infinity }}
              />
              <motion.div
                key="r2"
                className="absolute w-44 h-44 rounded-full border-4 border-purple-400"
                animate={{ scale: [1, 1.6], opacity: [0.5, 0] }}
                transition={{ duration: 1.8, repeat: Infinity }}
              />
            </>
          )}
        </AnimatePresence>
      </motion.div>

      {/* 🎮 Controls */}
      <div className="flex space-x-4 mt-6">
        {!recording ? (
          <button
            onClick={startRecording}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-full font-semibold shadow-md hover:shadow-xl transition-all"
          >
            <Mic className="inline-block mr-2 w-5 h-5" /> Start Recording
          </button>
        ) : (
          <>
            {!paused ? (
              <button
                onClick={pauseRecording}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-full font-semibold shadow-md hover:shadow-xl transition-all"
              >
                <Pause className="inline-block mr-2 w-5 h-5" /> Pause
              </button>
            ) : (
              <button
                onClick={resumeRecording}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-full font-semibold shadow-md hover:shadow-xl transition-all"
              >
                ▶ Resume
              </button>
            )}
            <button
              onClick={stopRecording}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full font-semibold shadow-md hover:shadow-xl transition-all"
            >
              <StopCircle className="inline-block mr-2 w-5 h-5" /> Stop
            </button>
          </>
        )}
      </div>

      {/* ⏱ Timer */}
      {recording && (
        <p className="text-lg font-medium text-gray-700 mt-2">
          ⏺ Recording —{" "}
          <span className="text-indigo-600 font-semibold">
            {String(Math.floor(duration / 60)).padStart(2, "0")}:
            {String(duration % 60).padStart(2, "0")}
          </span>
        </p>
      )}

      {/* 🎧 Playback & Save */}
      {audioUrl && !recording && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-10 bg-white shadow-xl rounded-3xl p-8 w-full max-w-md text-center border border-indigo-100"
        >
          <h2 className="text-xl font-semibold text-gray-800 mb-2">🎧 Your Recording</h2>
          <audio controls src={audioUrl} className="w-full rounded-lg mb-4" />
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={handleSaveRecording}
              className="flex-1 py-3 rounded-full bg-green-500 hover:bg-green-600 text-white font-semibold transition-all"
            >
              <Save className="inline-block mr-2 w-5 h-5" /> Save Recording
            </button>
            <button
              onClick={retryRecording}
              className="flex-1 py-3 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold"
            >
              <RefreshCw className="inline-block mr-2 w-5 h-5" /> Try Again
            </button>
            <button
              onClick={analyzeAudio}
              disabled={loading}
              className={`flex-1 py-3 rounded-full text-white font-semibold transition-all ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-indigo-500 to-purple-600 hover:shadow-2xl"
              }`}
            >
              {loading ? "Analyzing..." : "🔍 Analyze Speech"}
            </button>
          </div>
        </motion.div>
      )}

      {/* 📂 Upload Section */}
      <div className="mt-10 bg-white rounded-2xl shadow-md p-6 text-center w-full max-w-md border border-indigo-100">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">📂 Upload Audio File</h2>
        <input
          type="file"
          accept="audio/*"
          onChange={handleFileUpload}
          className="block mx-auto mb-3"
        />
        {uploadedFile && (
          <p className="text-sm text-gray-600 mb-2">
            Selected: {uploadedFile.name}
          </p>
        )}
        <button
          onClick={analyzeAudio}
          disabled={!uploadedFile || loading}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-full font-semibold shadow-sm transition-all"
        >
          {loading ? "Analyzing..." : "Analyze Uploaded File"}
        </button>
      </div>

      {/* 🧠 Feedback */}
      {feedback && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative w-full max-w-5xl mt-16"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-400/10 via-purple-400/10 to-pink-400/10 blur-3xl rounded-3xl" />
          <AnalyzeFeedback feedback={feedback} />
        </motion.div>
      )}

      {/* 📊 Chart */}
      {progress.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mt-16 bg-white/80 backdrop-blur-lg border border-indigo-100 rounded-3xl shadow-md p-6 mb-12 max-w-6xl w-full"
        >
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="w-6 h-6 text-indigo-600" />
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
                />
                <YAxis domain={[0, 10]} />
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
    </div>
  );
}
