import type { Feedback } from "@/lib/api";

export default function FeedbackCard({
  data,
  audioUrl,
}: { data: Feedback; audioUrl?: string }) {
  return (
    <div className="space-y-6">
      {audioUrl && (
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600 mb-2">AI voice feedback</p>
          <audio controls src={audioUrl} className="w-full" />
        </div>
      )}

      <Section title="Opening" body={data.opening} />
      <Section title="Content" body={data.content} />
      <Section title="Delivery" body={data.delivery} />
      <Section title="Grammar" body={data.grammar} />
      <Section title="Overall" body={data.overall} />

      {!!data?.suggestions?.length && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold text-gray-900 mb-3">Suggestions</h3>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            {data.suggestions!.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </div>
      )}

      {(data.filler_words || data.avg_sentence_length || data.word_count) && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold text-gray-900 mb-3">Stats</h3>
          <div className="text-sm text-gray-700 space-y-1">
            {data.word_count !== undefined && <div>Word count: {data.word_count}</div>}
            {data.avg_sentence_length !== undefined && (
              <div>Avg sentence length: {Math.round((data.avg_sentence_length + Number.EPSILON) * 10) / 10} words</div>
            )}
            {data.filler_words && (
              <div>
                Filler words:
                <span className="ml-2">
                  {Object.entries(data.filler_words).map(([k, v]) => `${k}(${v})`).join(", ") || "none"}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ title, body }: { title: string; body?: string }) {
  if (!body) return null;
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-700 leading-relaxed">{body}</p>
    </div>
  );
}
