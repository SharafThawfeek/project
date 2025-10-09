"use client";
import { useState } from "react";
import UploadForm from "@/components/UploadForm";
import LiveRecorder from "@/components/LiveRecorder";
import FeedbackCard from "@/components/FeedbackCard";
import { API_BASE } from "@/lib/api";

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
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">Speak</h1>
      <p className="text-gray-600">Upload an audio file or record live. We’ll analyze delivery, grammar, and content.</p>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="font-semibold mb-3">Upload Speech</h2>
          <UploadForm onResult={setResult} />
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="font-semibold mb-3">Live Recording</h2>
          <LiveRecorder onResult={setResult} />
        </div>
      </div>

      {result && (
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold text-gray-900 mb-2">Transcript</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{result.transcript || "—"}</p>
          </div>
          <FeedbackCard data={result.feedback} audioUrl={audioUrl} />
        </div>
      )}
    </div>
  );
}
