"use client";
import { useEffect, useRef, useState } from "react";
import { postAudio } from "@/lib/api";

export default function LiveRecorder({ onResult }: {
  onResult: (r: Awaited<ReturnType<typeof postAudio>>) => void;
}) {
  const mediaRec = useRef<MediaRecorder | null>(null);
  const chunks = useRef<BlobPart[]>([]);
  const [recording, setRecording] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => () => {
    if (mediaRec.current && mediaRec.current.state !== "inactive") mediaRec.current.stop();
  }, []);

  async function start() {
    setErr(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream, { mimeType: "audio/webm" });
      chunks.current = [];
      mr.ondataavailable = (e) => e.data.size && chunks.current.push(e.data);
      mr.onstop = async () => {
        const blob = new Blob(chunks.current, { type: "audio/webm" });
        const file = new File([blob], "recording.webm", { type: "audio/webm" });
        setLoading(true);
        try {
          const res = await postAudio(file);
          onResult(res);
        } catch (e: any) {
          setErr(e?.message || "Recording upload failed");
        } finally {
          setLoading(false);
        }
      };
      mediaRec.current = mr;
      mr.start();
      setRecording(true);
    } catch (e: any) {
      setErr(e?.message || "Mic permission denied");
    }
  }

  function stop() {
    if (mediaRec.current && mediaRec.current.state !== "inactive") {
      mediaRec.current.stop();
      mediaRec.current.stream.getTracks().forEach((t) => t.stop());
      setRecording(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        {!recording ? (
          <button onClick={start} className="px-5 py-2 rounded-lg bg-rose-600 text-white hover:bg-rose-700">
            Start Recording
          </button>
        ) : (
          <button onClick={stop} className="px-5 py-2 rounded-lg border border-gray-300 hover:bg-gray-100">
            Stop
          </button>
        )}
        {loading && <span className="text-sm text-gray-600 self-center">Analyzing...</span>}
      </div>
      {err && <p className="text-sm text-rose-600">{err}</p>}
    </div>
  );
}
