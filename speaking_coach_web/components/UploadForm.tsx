"use client";
import { useState } from "react";
import { postAudio } from "@/lib/api";

export default function UploadForm({ onResult }: {
  onResult: (r: Awaited<ReturnType<typeof postAudio>>) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async () => {
    if (!file) return;
    setLoading(true); setErr(null);
    try {
      const res = await postAudio(file);
      onResult(res);
    } catch (e: any) {
      setErr(e?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <input
        type="file"
        accept="audio/*"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="block w-full text-sm text-gray-700"
      />
      <button
        onClick={submit}
        disabled={!file || loading}
        className="px-5 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
      >
        {loading ? "Analyzing..." : "Upload & Analyze"}
      </button>
      {err && <p className="text-sm text-rose-600">{err}</p>}
    </div>
  );
}
